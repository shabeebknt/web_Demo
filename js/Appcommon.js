var Appcommon = Appcommon || {};

Appcommon.ClearForm = function(form) {
 
    if (form) {
        form.querySelectorAll('input, textarea').forEach(element => {
            element.value = '';
        });
    }
}


Appcommon.InitAOS_d_1000 = function() {
 
    AOS.init({
            duration: 1000 // sets default duration for all elements
        });

}


Appcommon.InitIsotope = function() {
 
   
document.querySelectorAll('.isotope-layout').forEach(function (isotopeItem) {
    let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
    let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
    let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

    let initIsotope;
    imagesLoaded(isotopeItem.querySelector('.isotope-container'), function () {
        initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
            itemSelector: '.isotope-item',
            layoutMode: layout,
            filter: filter,
            sortBy: sort
        });
    });

    isotopeItem.querySelectorAll('.isotope-filters li').forEach(function (filters) {
        filters.addEventListener('click', function () {
            isotopeItem.querySelector('.isotope-filters .filter-active').classList.remove('filter-active');
            this.classList.add('filter-active');
            initIsotope.arrange({
                filter: this.getAttribute('data-filter')
            });
            if (typeof aosInit === 'function') {
                aosInit();
            }
        }, false);
    });

});


}



