require('../interface.js');
delete require.cache[require.resolve('../interface.js')];
require('../interface.js');
const tressa = require('tressa');

const oInterface = Object.interface({
  handleEvent(e) { this['on' + e.type](e); }
});

const oInterfaceClick = Object.interface(
  oInterface,
  {onclick() { this.clicked = true; }}
);

const CInterface = Function.interface(
  {onclick() { this.clicked = true; }},
  class { handleEvent(e) { this['on' + e.type](e); } }
);

const oImplements = Object.implements(
  oInterfaceClick
);

const CImplements = (class {}).implements(
  oInterfaceClick
);

tressa.title('interface');
oImplements.handleEvent({type: 'click'});
tressa.assert(oImplements.clicked, 'objects interfaces work');
tressa.assert(!oInterfaceClick.constructor, 'objects interfaces have no constructor');
tressa.assert(!{}.propertyIsEnumerable.call(oImplements, 'handleEvent'), 'objects have non enumerables');
const instance = new CImplements;
instance.handleEvent({type: 'click'});
tressa.assert(instance.clicked, 'classes interfaces work');
tressa.assert(!CImplements.prototype.propertyIsEnumerable.call('handleEvent'), 'instances have non enumerables');