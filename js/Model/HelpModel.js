'use strict';

import { bus } from '../EventBus.js';

class HelpModel {

  constructor() {
    this.initialize();
  }

  changeTopic(topic) {
    this.topic = topic;
    this.saveTopic();
    bus.publish('topic.update', this.topic);
  }

  getTopic() {
    let topic = localStorage.getItem('topic');
    if (!topic) {
      topic = 'overview';
    } else {
      topic = JSON.parse(topic);
    }
    this.changeTopic(topic);
  }

  helpGet() {
    this.getTopic();
  }

  initialize() {
    this.subscribe();
  }

  saveTopic() {
    localStorage.setItem('topic', JSON.stringify(this.topic));
  }

  subscribe() {
    bus.subscribe('help.get', () => {
      this.helpGet();
    });
    bus.subscribe('topic.change', (topic) => {
      this.changeTopic(topic);
    });
  }

}

export { HelpModel };