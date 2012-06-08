/**
 * function addEvent
 * Needed for Drag and Drop, 11/25/2011. 
 * Also works on browsers that don't support addEventListener (IE) 
 */
var addEvent = (function () {
  if (document.addEventListener) {
    return function (el, type, fn) {
      if (el && el.nodeName || el === window) {
        el.addEventListener(type, fn, false);
      } else if (el && el.length) {
        for (var i = 0; i < el.length; i++) {
          addEvent(el[i], type, fn);
        }
      }
    };
  } else {
    return function (el, type, fn) {
      if (el && el.nodeName || el === window) {
        el.attachEvent('on' + type, function () { return fn.call(el, window.event); });
      } else if (el && el.length) {
        for (var i = 0; i < el.length; i++) {
          addEvent(el[i], type, fn);
        }
      }
    };
  }
})();

 
 /**
 * Drag and Drop
 * Enables user to drag a photo block from available items and drop into related items,
 * forming a relations entity. 
 * Permissions required to use.
 */ 
  (function ($) {
    Drupal.behaviors.relation_dragndrop_add = {
      attach: function (context, settings) {
// Limit to Profile Page (temporary until converted to js call from PHP)
if(location.href.indexOf('profile-main') >= 0){
        var dragLinks = document.querySelectorAll(".draggable-element"), dragElement = null; // querySelectorAll is IE8+ compatible
        var targetlinks = document.querySelectorAll('div.drop-target'), target = null; // querySelectorAll is IE8+ compatible
        if((dragLinks.length > 0) && (targetlinks.length > 0)) {
          // Check user permission
          $.get('/relation_dragndrop/permission/'+'access relation_dragndrop', function() {
            var msie = /*@cc_on!@*/0;
          
            /* Setup Drag Elements **************************************/
              for (var i = 0; i < dragLinks.length; i++) {
                dragElement = dragLinks[i];
              
                dragElement.setAttribute('draggable', 'true');
                dragElement.setAttribute('title', 'Drag and drop this photo into a collection.');
                 
                // nid was appended in Views Format Settings as node-[nid]. 
                dragElement.id = dragElement.className.split(' ').pop();
              
                addEvent(dragElement, 'dragstart', function (e) {
                  // IE doesn't pass the event object
                  if (e == null) e = window.event; 
    
                  e.dataTransfer.effectAllowed = 'copy'; // only dropEffect='copy' will be dropable
                  e.dataTransfer.setData('Text', this.id); // required otherwise doesn't work
                });
              }
                    
            /* Setup Drop Elements */
            for (var i = 0; i < targetlinks.length; i++) {
              target = targetlinks[i];
    
              target.setAttribute('droppable', 'true');
    
              /* nid was appended in Views Format Settings as node-[nid]. */
              target.id = target.className.split(' ').pop();
          
              /* Define Events *******************************************/
                addEvent(target, 'dragover', function (e) {
                  if (e.preventDefault) e.preventDefault(); // allows us to drop
                  e.dataTransfer.dropEffect = 'copy';
                  return false;
                });
              
                // to get IE to work
                addEvent(target, 'dragenter', function (e) {
                  return false;
                });
              
                addEvent(target, 'dragleave', function () {
                });
              
                addEvent(target, 'drop', function (e) {
                  var dragElement = document.getElementById(e.dataTransfer.getData('Text'));
                  if (dragElement.draggable) {
                    var url = '/relation_dragndrop/add/'+'tie'+'/'+this.id+'/'+dragElement.id;
                    $.get(url, function(response) {
                      // Refresh container's relation count
                      response = $.parseJSON(response);
                      Drupal.behaviors.relation_dragndrop_count_get(response['source_id']);
                    });
                  }
              
                  return false;
                });
            }
          });
        }
}
      }
    };
  }(jQuery));

  
 /**
 * Delete
 * Deletes a relation with a simple click. No confirmation follows, and the page does not move. 
 * Permissions required to use.
 */ 
  (function ($) {
    Drupal.behaviors.relation_dragndrop_delete = {
      attach: function (context, settings) {
// Limit to Profile Page (temporary until converted to js call from PHP)
if(location.href.indexOf('/content/collection/') >= 0){
        var delLinks = document.querySelectorAll(".deletable"), deleteElement = null; // querySelectorAll is IE8+ compatible
        var delBtnLinks = document.querySelectorAll(".delete-button"), deleteElement = null; // querySelectorAll is IE8+ compatible
        if((delLinks.length > 0) && (delBtnLinks.length > 0)) {
        // Check user permission
          $.get('/relation_dragndrop/permission/'+'access relation_dragndrop', function() {
            /* Setup Delete-able Elements **************************************/
              // Node Div
              for (var i = 0; i < delLinks.length; i++) {
                deleteElement = delLinks[i];
    
                // nid was appended in Views Format Settings as node-[nid]. 
                deleteElement.id = deleteElement.className.split(' ').pop();
              }
              
              // Delete Button
              for (var i = 0; i < delBtnLinks.length; i++) {
                deleteElement = delBtnLinks[i];
    
                // nid was appended in Views Format Settings as node-[nid]. 
                deleteElement.id = deleteElement.className.split(' ').pop();
                deleteElement.title = 'Move item out of this container.';
              }
              
            // Bind Button's Click Event to AJAX Delete URL
            $('div.delete-button:not(.relation_dragndrop-processed)', context).addClass('relation_dragndrop-processed')
            .bind('click', function(){
              var rid = this.id.split('-').pop();
              var url = '/relation_dragndrop/delete/'+rid;
              $.get(url, function() {
                $('div').remove('#relation-'+rid);
              });
              return false;
            });
          });
        }
}
      }
    };
  }(jQuery));
  
 /**
 * Count
 * Counts the number of relations within a source endpoint relations container. 
 */ 
  (function ($) {
    Drupal.behaviors.relation_dragndrop_count = {
      attach: function (context, settings) {
        /* Setup Count Elements **************************************/
          var links = document.querySelectorAll(".inner-count"), containerElement = null; // querySelectorAll is IE8+ compatible
          for (var i = 0; i < links.length; i++) {
            containerElement = links[i];

            // nid was appended in Views Format Settings as container-count-[nid]. 
            containerElement.id = containerElement.className.split(' ').pop();

            var nid = containerElement.id.split('-').pop();
            Drupal.behaviors.relation_dragndrop_count_get(nid);
          }
        
      }
    };
  }(jQuery));
  
 /**
 * Count get function
 * Passes to the Drupal callback function and processes the response. 
 *
 * @param nid
 *   The ID of the endpoint source node being processed. 
 *
 */ 
  (function ($) {
    Drupal.behaviors.relation_dragndrop_count_get = function(nid) {
      var url = '/relation_dragndrop/container-count/'+nid;
      $.get(url, function(response) {
        response = $.parseJSON(response);
        $('#container-count-'+response['nid']).replaceWith(response['element']);
      });
    };
  }(jQuery));
