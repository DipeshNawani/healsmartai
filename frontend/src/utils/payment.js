import API from '../utils/api';

/**
 * Opens Razorpay checkout and returns a Promise that resolves with payment data or rejects on failure.
 * Works in demo mode when Razorpay keys aren't configured.
 */
export const initiatePayment = async ({ amount, description, userName, userEmail, userPhone }) => {
    // 1. Create order on backend
    const { data: order } = await API.post('/payment/create-order', {
        amount,
        receipt: 'rcpt_' + Date.now(),
        notes: { description }
    });

    // 2. Demo mode — skip Razorpay UI
    if (order.demo) {
        await new Promise(r => setTimeout(r, 800));

        const { data: verification } = await API.post('/payment/verify', {
            razorpay_order_id: order.id,
            razorpay_payment_id: 'pay_demo_' + Date.now(),
            razorpay_signature: 'demo_sig'
        });

        return {
            paymentId: 'pay_demo_' + Date.now(),
            orderId: order.id,
            demo: true,
            verified: verification.verified
        };
    }

    // 3. Real Razorpay checkout
    return new Promise((resolve, reject) => {
        if (!window.Razorpay) {
            reject(new Error('Razorpay SDK not loaded. Please refresh the page.'));
            return;
        }

        let settled = false;
        const settle = (fn, val) => {
            if (!settled) {
                settled = true;
                fn(val);
            }
        };

        // Timeout — if nothing happens in 3 minutes, reject
        const timeoutId = setTimeout(() => {
            settle(reject, new Error('Payment timed out. Please try again.'));
        }, 3 * 60 * 1000);

        const options = {
            key: order.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name: 'HealSmart AI',
            description: description || 'Healthcare Payment',
            order_id: order.id,
            prefill: {
                name: userName || '',
                email: userEmail || '',
                contact: userPhone || ''
            },
            theme: {
                color: '#00D4AA'
            },
            handler: async function (response) {
                clearTimeout(timeoutId);
                try {
                    const { data: verification } = await API.post('/payment/verify', {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature
                    });

                    if (verification.verified) {
                        settle(resolve, {
                            paymentId: response.razorpay_payment_id,
                            orderId: response.razorpay_order_id,
                            signature: response.razorpay_signature,
                            verified: true
                        });
                    } else {
                        settle(reject, new Error('Payment verification failed'));
                    }
                } catch (err) {
                    settle(reject, err);
                }
            },
            modal: {
                ondismiss: function () {
                    clearTimeout(timeoutId);
                    settle(reject, new Error('Payment cancelled by user'));
                }
            }
        };

        try {
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                clearTimeout(timeoutId);
                settle(reject, new Error(response.error?.description || 'Payment failed'));
            });
            rzp.open();
        } catch (err) {
            clearTimeout(timeoutId);
            settle(reject, new Error('Failed to open payment window: ' + err.message));
        }
    });
};
