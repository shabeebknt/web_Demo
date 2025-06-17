var Appcommon = Appcommon || {};

Appcommon.ClearForm = function(form) {
 
    if (form) {
        form.querySelectorAll('input, textarea').forEach(element => {
            element.value = '';
        });
    }
}
