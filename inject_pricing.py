from bs4 import BeautifulSoup
import re

with open('man-lady-styling-lab.html', 'r') as f:
    soup = BeautifulSoup(f, 'html.parser')

# Check if #pricing already exists to avoid duplicates
if not soup.find(id='pricing'):
    pricing_html = """
    <div id="pricing" style="margin-top: 5rem; margin-bottom: 5rem; display: flex; gap: 1.5rem; justify-content: center; flex-wrap: wrap;">
        <!-- First 5 Ladies -->
        <div style="background: rgba(230,175,21,0.08); border: 2px solid rgba(230,175,21,0.5); border-radius: 14px; padding: 2rem 2.5rem; text-align: center; min-width: 250px; position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <span style="position: absolute; top: -12px; right: -10px; background: #ff2a5f; color: #fff; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; box-shadow: 0 4px 10px rgba(255,42,95,0.4);">This Weekend Only</span>
            <p style="color: var(--color-primary); font-size: 0.9rem; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 1rem;">🎫 First 5 Ladies</p>
            <p style="margin: 0; color: #fff; font-size: 1rem;"><span style="color: var(--color-primary); font-size: 2.2rem; font-weight: 900;">140 CHF</span></p>
            <p style="color: var(--color-primary); font-size: 0.85rem; font-weight: 600; margin: 0.5rem 0 1rem;">Special Early Rate</p>
            <hr style="border: none; border-top: 1px solid rgba(230,175,21,0.2); margin: 1rem 0;"/>
            <p style="color: rgba(255,255,255,0.4); text-decoration: line-through; font-size: 0.9rem; margin: 0 0 1.5rem;">190 CHF Regular</p>
            <a onclick="openModalWithTicket('ladies')" style="display: block; background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark)); color: #000; font-family: 'Anton'; font-weight: 700; font-size: 1rem; letter-spacing: 1px; padding: 0.8rem 1.5rem; border-radius: 50px; text-decoration: none; text-transform: uppercase; cursor: pointer;">🎟️ Grab Ladies Ticket</a>
        </div>
        
        <!-- First 5 Men -->
        <div style="background: rgba(230,175,21,0.08); border: 2px solid rgba(230,175,21,0.5); border-radius: 14px; padding: 2rem 2.5rem; text-align: center; min-width: 250px; position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <span style="position: absolute; top: -12px; right: -10px; background: #007bff; color: #fff; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; box-shadow: 0 4px 10px rgba(0,123,255,0.4);">This Weekend Only</span>
            <p style="color: var(--color-primary); font-size: 0.9rem; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 1rem;">🎫 First 5 Men</p>
            <p style="margin: 0; color: #fff; font-size: 1rem;"><span style="color: var(--color-primary); font-size: 2.2rem; font-weight: 900;">140 CHF</span></p>
            <p style="color: var(--color-primary); font-size: 0.85rem; font-weight: 600; margin: 0.5rem 0 1rem;">Special Early Rate</p>
            <hr style="border: none; border-top: 1px solid rgba(230,175,21,0.2); margin: 1rem 0;"/>
            <p style="color: rgba(255,255,255,0.4); text-decoration: line-through; font-size: 0.9rem; margin: 0 0 1.5rem;">190 CHF Regular</p>
            <a onclick="openModalWithTicket('men')" style="display: block; background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark)); color: #000; font-family: 'Anton'; font-weight: 700; font-size: 1rem; letter-spacing: 1px; padding: 0.8rem 1.5rem; border-radius: 50px; text-decoration: none; text-transform: uppercase; cursor: pointer;">🎟️ Grab Men Ticket</a>
        </div>
    </div>
    """
    
    # We also need the modal HTML and scripts
    modal_html = """
    <!-- Registration Modal -->
    <div class="modal-overlay" id="regModal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 9999; justify-content: center; align-items: center; overflow-y: auto; padding: 2rem 1rem;">
        <div class="modal-content" style="background: #111; border: 1px solid #333; border-radius: 20px; max-width: 500px; width: 100%; position: relative; padding: 2.5rem; box-shadow: 0 20px 50px rgba(0,0,0,0.8); margin: auto;">
            <button class="modal-close" onclick="closeModal()" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; color: #888; font-size: 2rem; cursor: pointer; line-height: 1; transition: color 0.3s;">&times;</button>
            <div class="text-center" style="margin-bottom: 2rem;">
                <h3 style="font-family: 'Anton'; font-size: 2rem; color: #fff; margin-bottom: 0.5rem; letter-spacing: 1px; text-transform: uppercase;">Register Now</h3>
                <p style="color: #aaa; font-size: 0.9rem; margin: 0;">Fill out your details to secure your spot.</p>
            </div>
            
            <form id="regForm" class="reg-form" style="display: flex; flex-direction: column; gap: 1rem;" onsubmit="submitForm(event)">
                <input type="hidden" name="event" value="Man-Lady Styling Lab 2027">
                <input type="hidden" name="ticket_type" id="ticketTypeInput" value="">
                <input type="hidden" name="price" id="ticketPriceInput" value="">
                
                <div class="form-group" style="display: flex; flex-direction: column; gap: 0.4rem;">
                    <label for="firstName" style="color: #ccc; font-size: 0.85rem; font-weight: 600;">First Name *</label>
                    <input type="text" id="firstName" name="first_name" required style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.8rem; color: #fff; font-size: 1rem; transition: border-color 0.3s;" onfocus="this.style.borderColor='var(--color-primary)'" onblur="this.style.borderColor='rgba(255,255,255,0.1)'">
                </div>
                
                <div class="form-group" style="display: flex; flex-direction: column; gap: 0.4rem;">
                    <label for="lastName" style="color: #ccc; font-size: 0.85rem; font-weight: 600;">Last Name *</label>
                    <input type="text" id="lastName" name="last_name" required style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.8rem; color: #fff; font-size: 1rem; transition: border-color 0.3s;" onfocus="this.style.borderColor='var(--color-primary)'" onblur="this.style.borderColor='rgba(255,255,255,0.1)'">
                </div>
                
                <div class="form-group" style="display: flex; flex-direction: column; gap: 0.4rem;">
                    <label for="email" style="color: #ccc; font-size: 0.85rem; font-weight: 600;">Email Address *</label>
                    <input type="email" id="email" name="email" required style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.8rem; color: #fff; font-size: 1rem; transition: border-color 0.3s;" onfocus="this.style.borderColor='var(--color-primary)'" onblur="this.style.borderColor='rgba(255,255,255,0.1)'">
                </div>
                
                <div class="form-group" style="display: flex; flex-direction: column; gap: 0.4rem;">
                    <label for="phone" style="color: #ccc; font-size: 0.85rem; font-weight: 600;">Phone Number *</label>
                    <input type="tel" id="phone" name="phone" required style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.8rem; color: #fff; font-size: 1rem; transition: border-color 0.3s;" onfocus="this.style.borderColor='var(--color-primary)'" onblur="this.style.borderColor='rgba(255,255,255,0.1)'">
                </div>
                
                <div id="formMsg" style="margin-top: 1rem; text-align: center; font-size: 0.9rem;"></div>
                
                <button type="submit" id="submitBtn" style="margin-top: 1.5rem; background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark)); color: #000; font-family: 'Anton'; font-size: 1.1rem; letter-spacing: 1px; padding: 1rem; border: none; border-radius: 50px; cursor: pointer; text-transform: uppercase; font-weight: 700; transition: transform 0.2s; box-shadow: 0 5px 15px rgba(230,175,21,0.3);">
                    Proceed to Payment
                </button>
            </form>
        </div>
    </div>
    <script>
        function openModalWithTicket(type) {
            const input = document.getElementById('ticketTypeInput');
            const priceInput = document.getElementById('ticketPriceInput');
            
            if (type === 'ladies') {
                input.value = 'First 5 Ladies';
                priceInput.value = '140 CHF';
            } else {
                input.value = 'First 5 Men';
                priceInput.value = '140 CHF';
            }
            
            document.getElementById('regModal').style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
        }

        function closeModal() {
            document.getElementById('regModal').style.display = 'none';
            document.body.style.overflow = '';
        }

        function submitForm(e) {
            e.preventDefault();
            const btn = document.getElementById('submitBtn');
            const msg = document.getElementById('formMsg');
            
            btn.innerHTML = 'Processing...';
            btn.disabled = true;
            
            const form = document.getElementById('regForm');
            const formData = new FormData(form);
            
            // Simulating form submission since Google Script URL might be different
            // In a real scenario, this would fetch() to the google script
            
            setTimeout(() => {
                msg.style.color = '#4CAF50';
                msg.innerHTML = 'Registration successful! Redirecting to payment...';
                
                // Redirect logic
                const ticketType = document.getElementById('ticketTypeInput').value;
                // You can add your actual Stripe checkout links here
                // window.location.href = 'YOUR_STRIPE_LINK';
                
                setTimeout(() => {
                    closeModal();
                    btn.innerHTML = 'Proceed to Payment';
                    btn.disabled = false;
                    form.reset();
                    msg.innerHTML = '';
                    alert('You would now be redirected to Stripe/Payment portal to pay 140 CHF for: ' + ticketType);
                }, 1500);
            }, 1000);
        }
    </script>
    """
    
    # Insert pricing just before the footer
    footer = soup.find('footer')
    if footer:
        footer.insert_before(BeautifulSoup(pricing_html, 'html.parser'))
        
        # Insert modal at the end of body
        soup.body.append(BeautifulSoup(modal_html, 'html.parser'))

with open('man-lady-styling-lab.html', 'w') as f:
    f.write(str(soup))
print("Pricing and modal added")
