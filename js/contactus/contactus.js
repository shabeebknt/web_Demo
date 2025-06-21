$(document).on('submit', '#contactForm', async function (event) {
    event.preventDefault();
    debugger;

    const submitButton = $('#contactUsSubmitButton');
    const spinner = $('#contactUsSpinner');
    const submitText = $('#contactUssubmitText');

    submitButton.prop('disabled', true);
    submitText.addClass('d-none');
    spinner.removeClass('visually-hidden');

    var response = await sendEmail(
        'service_fotf2uh',
        'template_qu001qo',
        'HZlDXrhR3PqDqQJuW',
        {
            title: "test",
            name: $('#name').val(),
            message: $('#description').val(),
            email: $('#email').val(),
            phone: $('#phone').val()
        }
    );

    spinner.addClass('visually-hidden');
    submitButton.prop('disabled', false);
    submitText.removeClass('d-none');

    if (response.ok === true) {
        $.alert({
            title: 'Success!',
            type: 'green',
            content: '<div class="custom-alert-content">Thank you! We will contact you shortly to confirm the details.</div>',
        });
        Appcommon.ClearForm(document.getElementById('contactForm'));
    }
});
