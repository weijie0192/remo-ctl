const MAX_LEVEL = 8;
const MAX_OBJECT = 10;
class Bound {
  constructor(x, y, w, h) {
    this.cX = x + w / 2;
    this.cY = y + h / 2;
    this.width = w;
    this.height = h;
    this.x = x;
    this.y = y;
  }
}

export default class QuadTree {
  constructor(level, bound) {
    this.list = [];
    this.nodes = [null, null, null, null];
    if (level === 1) {
      this.adjustBound(bound);
    } else this.bound = bound;
    this.level = level;
  }

  adjustBound(bound) {
    this.bound = new Bound(0, 0, bound.width, bound.height);
  }

  clear() {
    this.list = [];
    for (var i = 0; i < 4; ++i) {
      this.nodes[i] = null;
    }
  }

  split() {
    var newTreelevel = this.treelevel + 1,
      hw = this.bound.width / 2,
      hh = this.bound.height / 2;
    this.nodes[0] = new QuadTree(
      newTreelevel,
      new Bound(this.bound.x, this.bound.y, hw, hh)
    );
    this.nodes[1] = new QuadTree(
      newTreelevel,
      new Bound(this.bound.cX, this.bound.y, hw, hh)
    );
    this.nodes[2] = new QuadTree(
      newTreelevel,
      new Bound(this.bound.x, this.bound.cY, hw, hh)
    );
    this.nodes[3] = new QuadTree(
      newTreelevel,
      new Bound(this.bound.cX, this.bound.cY, hw, hh)
    );
  }

  defIndex(p) {
    var pr = p.radius,
      left = p.x - pr,
      right = p.x + pr,
      top = p.y + pr < this.bound.cY,
      bot = p.y - pr > this.bound.cY;
    if (right < this.bound.cX) {
      if (top) return 0;
      else if (bot) return 2;
    } else if (left > this.bound.cX) {
      if (top) return 1;
      else if (bot) return 3;
    }
    return -1;
  }

  insert(p) {
    var index;
    if (this.nodes[0] !== null) {
      index = this.defIndex(p);
      if (index !== -1) {
        this.nodes[index].insert(p);
        return;
      }
    }
    this.list.push(p);

    //split and move val to sub node if list is oversize
    if (this.list.size > MAX_OBJECT && this.treelevel < MAX_LEVEL) {
      if (this.nodes[0] === null) this.split();
      var it = this.list.first;
      while (it !== null) {
        index = this.defIndex(it.val);
        if (index !== -1) {
          this.nodes[index].insert(it.val);
          this.list.remove(it);
        }
        it = it.next;
      }
    }
  }

  retrieve(list, p) {
    var index = this.defIndex(p);
    if (this.nodes[0] !== null) {
      if (index !== -1) this.nodes[index].retrieve(list, p);
      else for (var i = 0; i < 4; ++i) this.nodes[i].retrieve(list, p);
    }
    list.connect(this.list);
    return list;
  }

  drawGrid(ctx) {
    for (var i = 0; i < 4; ++i) {
      if (this.nodes[i] !== null) {
        ctx.beginPath();
        ctx.moveTo(this.bound.x, this.bound.cY);
        ctx.lineTo(this.bound.x + this.bound.width, this.bound.cY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.bound.cX, this.bound.y);
        ctx.lineTo(this.bound.cX, this.bound.y + this.bound.height);
        ctx.stroke();
        this.nodes[i].drawGrid(ctx);
      }
    }
  }
}