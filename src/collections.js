var CommitCollection = Backbone.Collection.extend({
  model: Commit
});

var CommandCollection = Backbone.Collection.extend({
  model: Command
});

var CommandBuffer = Backbone.Model.extend({
  defaults: {
    collection: null,
  },

  initialize: function(options) {
    events.on('gitCommandReady', _.bind(
      this.addCommand, this
    ));

    options.collection.bind('add', this.addCommand, this);

    this.buffer = [];
    this.timeout = null;
    this.delay = 300;
  },

  addCommand: function(command) {
    this.buffer.push(command);
    this.touchBuffer();
  },

  touchBuffer: function() {
    // touch buffer just essentially means we just check if our buffer is being
    // processed. if it's not, we immediately process the first item
    // and then set the timeout.
    if (this.timeout) {
      // timeout existence implies its being processed
      return;
    }

    // process first element now
    this.popAndProcess();
    // always set the timeout, regardless of buffer size
    this.setTimeout();
  },


  setTimeout: function() {
    this.timeout = setTimeout(_.bind(function() {
        this.sipFromBuffer();
    }, this), 300);
  },

  popAndProcess: function() {
    var popped = this.buffer.pop();

    // find a command with no error
    while (popped.get('error') && this.buffer.length) {
      popped = buffer.pop();
    }
    // process it if theres no error
    if (!popped.get('error')) {
      events.trigger('processCommand', popped);
    }
  },

  clear: function() {
    clearTimeout(this.timeout);
    this.timeout = null;
  },

  sipFromBuffer: function() {
    if (!this.buffer.length) {
      this.clear();
      return;
    }

    this.popAndProcess();
    if (this.buffer.length) {
      this.setTimeout();
    } else {
      this.clear();
    }
  },
});
