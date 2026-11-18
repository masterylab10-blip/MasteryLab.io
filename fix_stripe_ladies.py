import re

with open('man-lady-styling-lab.html', 'r') as f:
    html = f.read()

old_logic = """                if (ticketType === 'First 5 Men') {
                    window.location.href = 'https://buy.stripe.com/dRm8wRaWi4K8dnI7qWdEs0S';
                } else {
                    alert('Stripe link for Ladies ticket pending... You selected: ' + ticketType);
                    closeModal();
                    btn.innerHTML = 'Proceed to Payment';
                    btn.disabled = false;
                    form.reset();
                    msg.innerHTML = '';
                }"""

new_logic = """                if (ticketType === 'First 5 Men') {
                    window.location.href = 'https://buy.stripe.com/dRm8wRaWi4K8dnI7qWdEs0S';
                } else if (ticketType === 'First 5 Ladies') {
                    window.location.href = 'https://buy.stripe.com/8x29AVaWiccAerMfXsdEs0T';
                } else {
                    closeModal();
                    btn.innerHTML = 'Proceed to Payment';
                    btn.disabled = false;
                    form.reset();
                    msg.innerHTML = '';
                }"""

html = html.replace(old_logic, new_logic)

with open('man-lady-styling-lab.html', 'w') as f:
    f.write(html)
print("Stripe link for ladies added")
