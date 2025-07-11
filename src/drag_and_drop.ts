/**
This code is taken almost directly from https://github.com/phuocng/html-dom/, drag-and-drop-element-in-a-list

Thank you, Phuoc!

A scrollY was added to fix a snap-to-top issue on scrolled pages.
**/

let draggingEle: HTMLElement;
let placeholder: HTMLElement;
let isDraggingStarted = false;
let callOnDrag: () => void;

// The current position of mouse relative to the dragging element
let draggingY = 0;

// swap two nodes
const swapDraggableNodes = function (nodeA: Element, nodeB: Element) {
   const parentA = nodeA.parentNode;
   const siblingA = nodeA.nextSibling === nodeB ? nodeA : nodeA.nextSibling;

   // Move `nodeA` to before the `nodeB`
   nodeB.parentNode.insertBefore(nodeA, nodeB);

   // Move `nodeB` to before the sibling of `nodeA`
   parentA.insertBefore(nodeB, siblingA);
};

// Check if `nodeA` is above `nodeB`
const nodeIsAbove = function (nodeA: Element, nodeB: Element) {
   // Get the bounding rectangle of nodes
   const rectA = nodeA.getBoundingClientRect();
   const rectB = nodeB.getBoundingClientRect();

   return rectA.top + rectA.height / 2 < rectB.top + rectB.height / 2;
};

const draggableLayerMouseDownHandler = function (e: MouseEvent) {
   draggingEle = e.target as HTMLElement;
   if (draggingEle.className != "draggable_layer_div") {
      return;
   }

   // Calculate the mouse position
   const rect = draggingEle.getBoundingClientRect();
   draggingY = e.pageY - rect.top;

   // Attach the listeners to `document`
   document.addEventListener('mousemove', draggableLayerMouseMoveHandler);
   document.addEventListener('mouseup', draggableLayerMouseUpHandler.bind(callOnDrag));
};

const draggableLayerMouseMoveHandler = function (e: MouseEvent) {
   const draggingRect = draggingEle.getBoundingClientRect();

   if (!isDraggingStarted) {
      isDraggingStarted = true;

      // Let the placeholder take the height of dragging element
      // So the next element won't move up
      placeholder = document.createElement('div');
      placeholder.classList.add('placeholder');
      draggingEle.parentNode.insertBefore(placeholder, draggingEle.nextSibling);
      placeholder.style.height = `${draggingRect.height}px`;
   }

   // Set position for dragging element
   draggingEle.style.position = 'absolute';
   draggingEle.style.top = `${e.pageY - draggingY + window.scrollY}px`;

   // The current order
   // prevEle
   // draggingEle
   // placeholder
   // nextEle
   const prevEle = draggingEle.previousElementSibling;
   const nextEle = placeholder.nextElementSibling;

   // The dragging element is above the previous element
   // User moves the dragging element to the top
   if (prevEle && nodeIsAbove(draggingEle, prevEle)) {
      // The current order    -> The new order
      // prevEle              -> placeholder
      // draggingEle          -> draggingEle
      // placeholder          -> prevEle
      swapDraggableNodes(placeholder, draggingEle);
      swapDraggableNodes(placeholder, prevEle);
      return;
   }

   // The dragging element is below the next element
   // User moves the dragging element to the bottom
   if (nextEle && nodeIsAbove(nextEle, draggingEle)) {
      // The current order    -> The new order
      // draggingEle          -> nextEle
      // placeholder          -> placeholder
      // nextEle              -> draggingEle
      swapDraggableNodes(nextEle, placeholder);
      swapDraggableNodes(nextEle, draggingEle);
   }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const draggableLayerMouseUpHandler = function (e: MouseEvent) {

   // Remove the placeholder
   if (placeholder) {
      placeholder.parentNode.removeChild(placeholder);
   }

   draggingEle.style.removeProperty('top');
   draggingEle.style.removeProperty('left');
   draggingEle.style.removeProperty('position');

   draggingY = null;
   draggingEle = null;
   isDraggingStarted = false;

   // Remove the handlers of `mousemove` and `mouseup`
   document.removeEventListener('mousemove', draggableLayerMouseMoveHandler);
   document.removeEventListener('mouseup', draggableLayerMouseUpHandler);

   // I genuinely hate that I'm doing this. I feel like passing a callback through
   // should be possible--and probably straightforward to boot--but I've been playing
   // with it for an hour now and don't feel any closer to success. I'll return
   // when my uderstanding of bind, arrow operators, and the intricacies of their use
   // has improved. TODO!
   callOnDrag();
};

export { draggableLayerMouseDownHandler };