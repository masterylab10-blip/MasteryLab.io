import re

with open('man-lady-styling-lab.html', 'r') as f:
    html = f.read()

# Replace the redirect logic block in submitForm
old_logic = """                // Redirect logic
                const ticketType = document.getElementById('ticketTypeInput').value;
                // You can add your actual Stripe checkout links here
                // window.location.href = 'YOUR_STRIPE_LINK';
                
                setTimeout(() => {
                    closeModal();
                    btn.innerHTML = 'Proceed to Payment';
                    btn.disabled = false;
                    form.reset();
                    msg.innerHTML = '';
                    alert('You would now be redirected to Stripe/Payment portal to pay 160 CHF for: ' + ticketType);
                }, 1500);"""

new_logic = """                // Redirect logic
                const ticketType = document.getElementById('ticketTypeInput').value;
                
                if (ticketType === 'First 5 Men') {
                    window.location.href = 'https://buy.stripe.com/dRm8wRaWi4K8dnI7qWdEs0S';
                } else {
                    alert('Stripe link for Ladies ticket pending... You selected: ' + ticketType);
                    closeModal();
                    btn.innerHTML = 'Proceed to Payment';
                    btn.disabled = false;
                    form.reset();
                    msg.innerHTML = '';
                }"""

html = html.replace(old_logic, new_logic)

with open('man-lady-styling-lab.html', 'w') as f:
    f.write(html)
print("Stripe link added")
