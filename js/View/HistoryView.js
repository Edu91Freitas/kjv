'use strict';

import { bus } from '../EventBus.js';

import { removeAllChildren } from '../util.js';

import {
  templateActionMenu,
  templateBtnIcon,
  templateElement,
  templatePage,
  templatePageScroll,
  templateToolbarLower,
  templateToolbarUpper
} from '../template.js';

const actionSet = [
  { icon: 'up', label: 'Up' },
  { icon: 'down', label: 'Down' },
  { icon: 'delete', label: 'Delete' },
  { icon: 'cancel', label: 'Cancel' }
];

const lowerToolSet = [
  { type: 'btn', icon: 'back', label: 'Back' }
];

const upperToolSet = [
  { type: 'banner', modifier: 'history', text: 'History' }
];

class HistoryView {

  constructor() {
    this.initialize();
  }

  actionMenuClick(event) {
    event.preventDefault();
    let btn = event.target.closest('button');
    if (btn === this.btnCancel) {
      this.actionMenu.classList.add('action-menu--hide');
      return;
    }
    let entry = this.activeEntry.querySelector('.btn-entry--history');
    let query = entry.textContent;
    switch (btn) {
      case this.btnDelete:
        this.delete(query);
        break;
      case this.btnDown:
        this.down(query);
        break;
      case this.btnUp:
        this.up(query);
    }
    this.actionMenu.classList.add('action-menu--hide');
  }

  addListeners() {
    this.actionMenu.addEventListener('click', (event) => {
      this.actionMenuClick(event);
    });
    this.list.addEventListener('click', (event) => {
      this.listClick(event);
    });
    this.toolbarLower.addEventListener('click', (event) => {
      this.toolbarLowerClick(event);
    });
  }

  btnMenuClick(target) {
    this.showActionMenu(target);
  }

  buildEntry(query) {
    let entry = document.createElement('div');
    entry.classList.add('entry', 'entry--history');
    let btnEntry = document.createElement('button');
    btnEntry.classList.add('btn-entry', 'btn-entry--history');
    btnEntry.textContent = query;
    let btnMenu = templateBtnIcon('menu', 'Menu');
    entry.appendChild(btnEntry);
    entry.appendChild(btnMenu);
    return entry;
  }

  buildPage() {
    this.page = templatePage('history');

    this.toolbarUpper = templateToolbarUpper(upperToolSet);
    this.page.appendChild(this.toolbarUpper);

    this.scroll = templatePageScroll('history');
    this.empty = templateElement('div', 'empty', 'history', null, 'No searches saved.');
    this.scroll.appendChild(this.empty);
    this.list = templateElement('div', 'list', 'history', null, null);
    this.scroll.appendChild(this.list);
    this.actionMenu = templateActionMenu('history', actionSet);
    this.scroll.appendChild(this.actionMenu);
    this.page.appendChild(this.scroll);

    this.toolbarLower = templateToolbarLower(lowerToolSet);
    this.page.appendChild(this.toolbarLower);

    let container = document.querySelector('.container');
    container.appendChild(this.page);
  }

  delete(query) {
    bus.publish('action.history.delete', query);
  }

  down(query) {
    bus.publish('action.history.down', query);
  }

  getElements() {
    this.btnUp = this.actionMenu.querySelector('.btn-icon--up');
    this.btnDown = this.actionMenu.querySelector('.btn-icon--down');
    this.btnDelete = this.actionMenu.querySelector('.btn-icon--delete');
    this.btnCancel = this.actionMenu.querySelector('.btn-icon--cancel');

    this.btnBack = this.toolbarLower.querySelector('.btn-icon--back');
  }

  historyHide() {
    this.actionMenu.classList.add('action-menu--hide');
    this.page.classList.add('page--hide');
  }

  historyScrollToTop() {
    if (this.page.classList.contains('page--hide')) {
      this.scrollReset = true;
      return;
    }
    this.scroll.scrollTop = 0;
  }

  historyShow() {
    this.page.classList.remove('page--hide');
    if (this.scrollReset) {
      this.scroll.scrollTop = 0;
      this.scrollReset = false;
    }
  }

  historyUpdate(history) {
    this.history = history;
    this.updateList();
  }

  initialize() {
    this.buildPage();
    this.getElements();
    this.addListeners();
    this.subscribe();
  }

  listClick(event) {
    event.preventDefault();
    let target = event.target.closest('button');
    if (target.classList.contains('btn-entry--history')) {
      let query = target.textContent;
      bus.publish('action.history.select', query);
      return;
    }
    if (target.classList.contains('btn-icon--menu')) {
      let entry = target.previousSibling;
      this.btnMenuClick(entry);
      return;
    }
  }

  showActionMenu(target) {
    this.activeEntry = target.closest('div');
    let top = target.offsetTop;
    this.actionMenu.style.top = `${top}px`;
    this.actionMenu.classList.remove('action-menu--hide');
  }

  subscribe() {
    bus.subscribe('history.hide', () => {
      this.historyHide();
    });
    bus.subscribe('history.scroll-to-top', () => {
      this.historyScrollToTop();
    });
    bus.subscribe('history.show', () => {
      this.historyShow();
    });
    bus.subscribe('history.update', (history) => {
      this.historyUpdate(history);
    });
  }

  toolbarLowerClick(event) {
    event.preventDefault();
    let target = event.target.closest('button');
    if (target === this.btnBack) {
      bus.publish('action.history.back', null);
    }
  }

  up(query) {
    bus.publish('action.history.up', query);
  }

  updateList() {
    removeAllChildren(this.list);
    if (this.history.length === 0) {
      this.empty.classList.remove('empty--hide');
      return;
    } else {
      this.empty.classList.add('empty--hide');
    }
    let fragment = document.createDocumentFragment();
    for (let query of this.history) {
      let entry = this.buildEntry(query);
      fragment.appendChild(entry);
    }
    this.list.appendChild(fragment);
  }

}

export { HistoryView };
