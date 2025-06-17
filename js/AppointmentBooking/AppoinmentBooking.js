$(document).ready(function () {
    $('.datepicker').datepicker({
        format: 'mm/dd/yyyy',
        autoclose: true,
        todayHighlight: true,
        startDate: new Date()  // Disables all dates before today
    });






    //$('#btnSubmitAppoinment').click(function () {
    //    $('[data-bs-dismiss="modal"]').trigger("click");  // hides the modal
    //    $.alert({
    //        title: 'Success!',
    //        type: 'green',
    //        content: 'Thank you! Your appointment has been successfully booked. We will contact you shortly to confirm the details.',
    //    });

   


    //    });
    




});