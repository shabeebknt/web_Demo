document.addEventListener('DOMContentLoaded', function () {
    const appointmentForm = document.querySelector('#AppoinmentBooking');

    if (appointmentForm) {



        appointmentForm.addEventListener('submit', async function (event) {

            event.preventDefault();

            const submitButton = document.getElementById('btnAppoinmentBooking');
            const spinner = document.getElementById('AppoinmentSpinner');
            const submitText = document.getElementById('AppoinmentSpinnerSubmitText');

            submitButton.disabled = true;
            submitText.classList.add('d-none');
            spinner.classList.remove('visually-hidden');

            var response =  await sendEmail(
                'service_fotf2uh',
                'template_bhljqhx',
                'HZlDXrhR3PqDqQJuW',
                {
                    name: document.getElementById("Name").value,
                    mobileNumber: document.getElementById("MobileNumber").value,
					date: document.getElementById("AppintmentDate").value,
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
                Appcommon.ClearForm(appointmentForm);
                $('[data-bs-dismiss="modal"]').trigger("click");
            }


		});
    }
});
