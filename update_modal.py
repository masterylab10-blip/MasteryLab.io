import re

with open('man-lady-styling-lab.html', 'r') as f:
    html = f.read()

# Add the Role dropdown before the Phone Number
old_phone = """<div class="form-group" style="display: flex; flex-direction: column; gap: 0.4rem;">
                    <label for="phone" style="color: #ccc; font-size: 0.85rem; font-weight: 600;">Phone Number *</label>"""

new_role_and_phone = """<div class="form-group" style="display: flex; flex-direction: column; gap: 0.4rem;">
                    <label for="role" style="color: #ccc; font-size: 0.85rem; font-weight: 600;">Role *</label>
                    <select id="role" name="role" required style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.8rem; color: #fff; font-size: 1rem; transition: border-color 0.3s; appearance: none;" onfocus="this.style.borderColor='var(--color-primary)'" onblur="this.style.borderColor='rgba(255,255,255,0.1)'">
                        <option value="" disabled selected style="background: #111;">Select your role</option>
                        <option value="Dancer" style="background: #111;">Dancer</option>
                        <option value="Teacher" style="background: #111;">Teacher</option>
                    </select>
                </div>
                
                <div class="form-group" style="display: flex; flex-direction: column; gap: 0.4rem;">
                    <label for="phone" style="color: #ccc; font-size: 0.85rem; font-weight: 600;">Phone Number *</label>"""

html = html.replace(old_phone, new_role_and_phone)

# Update submitForm logic
old_submit = """            // Simulating form submission since Google Script URL might be different
            // In a real scenario, this would fetch() to the google script
            
            setTimeout(() => {
                msg.style.color = '#4CAF50';
                msg.innerHTML = 'Registration successful! Redirecting to payment...';
                
                // Redirect logic
                const ticketType = document.getElementById('ticketTypeInput').value;
                
                if (ticketType === 'First 5 Men') {
                    window.location.href = 'https://buy.stripe.com/dRm8wRaWi4K8dnI7qWdEs0S';
                } else if (ticketType === 'First 5 Ladies') {
                    window.location.href = 'https://buy.stripe.com/8x29AVaWiccAerMfXsdEs0T';
                } else {
                    closeModal();
                    btn.innerHTML = 'Proceed to Payment';
                    btn.disabled = false;
                    form.reset();
                    msg.innerHTML = '';
                }
            }, 1000);"""

new_submit = """            const googleScriptURL = 'https://script.google.com/macros/s/AKfycbzb8BlBMh5BwOl_Z7QuOdTVWJpjReASpqP4SYn18P4l839fNlZTWo2thNy4gzr2f7aNSA/exec';
            
            fetch(googleScriptURL, {
                method: 'POST',
                body: formData
            })
            .then(response => {
                msg.style.color = '#4CAF50';
                msg.innerHTML = 'Registration successful! Redirecting to payment...';
                
                // Redirect logic
                const ticketType = document.getElementById('ticketTypeInput').value;
                
                setTimeout(() => {
                    if (ticketType === 'First 5 Men') {
                        window.location.href = 'https://buy.stripe.com/dRm8wRaWi4K8dnI7qWdEs0S';
                    } else if (ticketType === 'First 5 Ladies') {
                        window.location.href = 'https://buy.stripe.com/8x29AVaWiccAerMfXsdEs0T';
                    } else {
                        closeModal();
                        btn.innerHTML = 'Proceed to Payment';
                        btn.disabled = false;
                        form.reset();
                        msg.innerHTML = '';
                    }
                }, 1000);
            })
            .catch(error => {
                msg.style.color = '#ff4444';
                msg.innerHTML = 'Error submitting registration. Please try again or contact support.';
                btn.innerHTML = 'Proceed to Payment';
                btn.disabled = false;
                console.error('Error!', error.message);
            });"""

html = html.replace(old_submit, new_submit)

with open('man-lady-styling-lab.html', 'w') as f:
    f.write(html)
print("Modal and submit logic updated")
