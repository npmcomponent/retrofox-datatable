
/**
 * Component dependencies
 */

var o = require('component-jquery');
var type = require('component-type');
var free = require('cristiandouce-tags-free');
var Pager = require('component-pager');

/**
 * Expose `DataTable`
 */

module.exports = DataTable;

/**
 * Expose `DataTable`
 *
 * @api public
 */

function DataTable(){
  if (!(this instanceof DataTable)) return new DataTable;
  this.config = {
    sort:   { col: 0, dir: 1 } ,
    pager:  { page: 0, perpage: 10 }
  };

  // get markup template
  this.el = o(require('./template'));
  this.columns = [];
  this.rows = [];
  return this;
}

/**
 * Add new row to DataTable
 *
 * @param {Array} row
 * @api public
 */

DataTable.prototype.add = function(row){
  if (!row.length) return this;
  this.rows.push(row);
  return this;
};

/**
 * Add a lot of rows
 *
 * @param {Array} data
 * @api public
 */

DataTable.prototype.load = function(data){
  if (!data.length) return this;
  for (var i = 0; i < data.length; i++) {
    this.add(data[i]);
  }
  return this;
};

/**
 * Set table header
 *
 * @param {Array} rows
 * @api public
 */

DataTable.prototype.header = function(cols){
  if (!cols.length) return this;

  for (var i = 0, col = cols[0]; i < cols.length; i++, col = cols[i]) {
    this.column(col);
  }

  return this;
};

/**
 * Set column to table header
 *
 * @param {String|Array} rows
 * @return {Datable} this
 * @api private
 */

DataTable.prototype.column = function(column) {
  var title = 0;
  var sort = 1;
  var sortType = 2;
  var isstr = 'string' == type(column);
  var cssname = !isstr && column[sort] ? 'sort' : '';
  var el;

  var el;
  if (isstr) {
    el = o('<span>');
  } else {
    el = o('<a>', { href: '#', class: cssname })
    .click(this.onsort.bind(this, column[sortType] || 'numeric' ));
  }

  o('<th>')
  .append( el.html( isstr ? column : column[title] ) )
  .appendTo( this.el.find('thead tr') );

  // add column to columns list
  this.columns.push(column);

  // set colspan in footer element
  this.el.find('tfoot tr td').attr('colspan', this.columns.length);

  return this;
};

/**
 * Render the table body
 *
 * @api private
 */

DataTable.prototype.body = function(){
  var prg = this.config.pager;
  var ini = prg.page * prg.perpage;
  var end = Math.min(ini + prg.perpage, this.rows.length);

  this.el.find('tbody').empty();
  for (var j = ini, row = this.rows[ini]; j < end; j++, row = this.rows[j]) {
    for (var i = 0, tr = o('<tr>'); i < row.length; i++) {
      tr.append(o('<td>', { html: row[i] }));
    }
    this.el.find('tbody').append(tr);
  }
};

/**
 * Bind `click` event in table header
 *
 * @param {string} type
 * @param {Object} ev jQuery object event
 * @api public
 */

DataTable.prototype.onsort = function(type, ev){
  ev.preventDefault();
  var el = o(ev.target);
  var th = el.closest('th');

  var col = th.prevAll().length;
  var dir = el.hasClass('asc') ? -1 : 1;

  this.sort(col, dir, type);
};

/**
 * Sort the tabe data
 *
 * @api public
 */

DataTable.prototype.sort = function(col, dir, type){
  var th = this.el.find('thead tr th').eq(col);
  var el = th.find('a');

  this.el.find('thead th a').removeClass('asc desc');
  el[(dir > 0 ? 'add' : 'remove') + 'Class']('asc');
  el[(dir < 0 ? 'add' : 'remove') + 'Class']('desc');

  sortBy(this.rows, col, dir, type);
  this.body();
  return this;
};

/**
 * Add paginate to table footer
 *
 * Emit `pager` event
 *
 * @param {Object} opts pager options
 * @api private
 */

DataTable.prototype.paginate = function(page, perpage){
  this.config.pager.page = page;
  this.config.pager.perpage = perpage;

  var pager = new Pager;
  pager.el.appendTo(this.el.find('tfoot td').get(0));

  this.el.find('tfoot td').append(
    pager
    .total(this.rows.length)
    .perpage(perpage || 10)
    .select(page || 0)
    .render()
  );

  // Emit `pager` event
  pager.on('show', this.onpager.bind(this));
  return this;
};

/**
 * Bind pager `show` event
 *
 * @param {Number} page select page
 * @api public
 */

DataTable.prototype.onpager = function(page){
  this.config.pager.page = page;
  this.body();
};

/**
 * Render component
 *
 * @api public
 */

DataTable.prototype.render = function(){
  this.body();
  return this.el;
};

/**
 * Replace markup into the given element
 *
 * @param {String|jQuery} el reference element to inject the markup
 * @api public
 */

DataTable.prototype.replace = function(el){
  o(el).append(this.render());
};

/**
 * Sort the given array by col and dir
 *
 * @param {Array} arr array to sort
 * @param {Number} col
 * @param {Number} dir
 */

function sortBy(arr, col, dir, type){
  arr.sort(function(e0, e1){
    var v0 = e0[col];
    var v1 = e1[col];

    switch(type) {
      case 'numeric':
        v0 = Number(v0);
        v1 = Number(v1);
        break;
      case 'alpha':
        v0 = free(v0).trim();
        v1 = free(v1).trim();
        break;
    }
    return (v1 < v0 ? 1 : -1) * dir;
  });
}
