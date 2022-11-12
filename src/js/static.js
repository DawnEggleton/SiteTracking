function toggleMenu(e) {
    e.parentNode.classList.toggle('is-open');
}
function getMonthName(monthNum) {
    switch(monthNum) {
        case 0:
            return 'january';
            break;
        case 1:
            return 'february';
            break;
        case 2:
            return 'march';
            break;
        case 3:
            return 'april';
            break;
        case 4:
            return 'may';
            break;
        case 5:
            return 'june';
            break;
        case 6:
            return 'july';
            break;
        case 7:
            return 'august';
            break;
        case 8:
            return 'september';
            break;
        case 9:
            return 'october';
            break;
        case 10:
            return 'november';
            break;
        case 11:
            return 'december';
            break;
        default:
            break;
    }
}
function capitalize(str, separators) {
    separators = separators || [ ' ' ];
    var regex = new RegExp('(^|[' + separators.join('') + '])(\\w)', 'g');
    return str.replace(regex, function(x) { return x.toUpperCase(); });
}
function setIsotope() {
    function manageCheckbox( $checkbox ) {
        var checkbox = $checkbox[0];
        var group = $checkbox.parents('.filter-group').attr('data-filter-group');
        
        // create array for filter group, if not there yet
        var filterGroup = filters[ group ];
        
        if ( !filterGroup ) {
        filterGroup = filters[ group ] = [];
        }
    
        var isAll = $checkbox.hasClass('all');
        
        // reset filter group if the all box was checked
        if ( isAll ) {
        delete filters[ group ];
        if ( !checkbox.checked ) {
            checkbox.checked = 'checked';
        }
        }
        
        // index of
        var index = $.inArray( checkbox.value, filterGroup );
        
        if ( checkbox.checked ) {
        var lSelector = isAll ? 'label' : 'label.all';
        var iSelector = isAll ? 'input' : 'input.all';
        $checkbox.parent().siblings(lSelector).removeClass('is-checked');
        $checkbox.parent().addClass('is-checked');
        $checkbox.parent().siblings(lSelector).children(iSelector).prop('checked', false);
        
    
        if ( !isAll && index === -1 ) {
            // add filter to group
            filters[ group ].push( checkbox.value );
        }
        } else if ( !isAll ) {
        // remove filter from group
        filters[ group ].splice( index, 1 );
        
        // if unchecked the last box, check the all
        if (filters[group].length == 0) {
            $checkbox.parent().siblings('label.all').addClass('is-checked');
            $checkbox.parent().siblings().children('input.all').prop('checked', true);
        }
        $checkbox.parent().removeClass('is-checked');
        }
    
    }
    function getComboFilter( filters ) {
        var i = 0;
        var comboFilters = [];
    
        for ( var prop in filters ) {
        var filterGroup = filters[ prop ];
        // skip to next filter group if it doesn't have any values
        if ( !filterGroup.length ) {
            continue;
        }
        if ( i === 0 ) {
            // copy to new array
            comboFilters = filterGroup.slice(0);
        } else {
            var filterSelectors = [];
            // copy to fresh array
            var groupCombo = comboFilters.slice(0); // [ A, B ]
            // merge filter Groups
            for (var k=0, len3 = filterGroup.length; k < len3; k++) {
            for (var j=0, len2 = groupCombo.length; j < len2; j++) {
                filterSelectors.push( groupCombo[j] + filterGroup[k] ); // [ 1, 2 ]
            }
    
            }
            // apply filter selectors to combo filters for next group
            comboFilters = filterSelectors;
        }
        i++;
        }
    
        var comboFilter = comboFilters.join(', ');
        return comboFilter;
    }
    
    var $container;
    var filters = {};

    $(function(){

        $container = $('.grid-container');


        $container.isotope();
        // do stuff when checkbox change
        $('.filters').on( 'change', function( jQEvent ) {
            var $checkbox = $( jQEvent.target );
            manageCheckbox( $checkbox );

            var comboFilter = getComboFilter( filters );

            $container.isotope({ 
                itemSelector: '.grid-item',
                percentPosition: true,
                filter: comboFilter
            });

        });

    });
}