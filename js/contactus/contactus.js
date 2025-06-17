document.addEventListener('DOMContentLoaded', function ()
{
    const contactForm = document.querySelector('#contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', async function (event)
        {
            event.preventDefault();

            const submitButton = document.getElementById('contactUsSubmitButton');
            const spinner = document.getElementById('contactUsSpinner');
            const submitText = document.getElementById('contactUssubmitText');

            submitButton.disabled = true;
            submitText.classList.add('d-none');
            spinner.classList.remove('visually-hidden');

      

            var response = await sendEmail(
                'service_fotf2uh',
                'template_qu001qo',
                'HZlDXrhR3PqDqQJuW',
                {
                    title: "test",
                    name: document.getElementById("name").value,
                    message: document.getElementById("description").value,
                    email: document.getElementById("email").value,
                    phone: document.getElementById("phone").value
                }
            );

            spinner.classList.add('visually-hidden');
            submitButton.disabled = false;
            submitText.classList.remove('d-none');

            if (response.ok == true) {
                $.alert({
                    title: 'Success!',
                    type: 'green',
                    content: '<div class="custom-alert-content">Thank you! We will contact you shortly to confirm the details.</div>',
                });
                Appcommon.ClearForm(contactForm);
            }


        });
    }
});
