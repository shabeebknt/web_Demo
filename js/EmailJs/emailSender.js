async function sendEmail(serviceId, templateId, userId, templateParams, callback)
{
    var data = {
        service_id: serviceId,
        template_id: templateId,
        user_id: userId,
        template_params: templateParams
    };

    try {
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

     
        return response;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}
