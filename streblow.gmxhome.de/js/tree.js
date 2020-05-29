   // node object
  function node(id, pid, name, url, title, target, icon, iconOpen, open) {
    this.id = id;
    this.pid = pid;
    this.name = name;
    this.url = url;
    this.title = title;
    this.target = target;
    this.icon = icon;
    this.iconOpen = iconOpen;
    this._io = open || false;
    this._is = false;
    this._ls = false;
    this._hc = false;
    this._ai = 0;
    this._p;
  };
  // tree object
  function tree(objName) {
    this.config = {
      target : null,
      folderLinks : true,
      useSelection : true,
      useCookies : true,
      useLines : true,
      useIcons : true,
      useStatusText : false,
      closeSameLevel : false,
      inOrder : false
    }
    this.icon = {
      root : '../pic/home.gif',
      folder : '../pic/folder.gif',
      folderOpen : '../pic/folderopen.gif',
      node : '../pic/page.gif',
      empty : '../pic/empty.gif',
      line : '../pic/line.gif',
      join : '../pic/join.gif',
      joinBottom : '../pic/joinbottom.gif',
      plus : '../pic/plus.gif',
      plusBottom : '../pic/plusbottom.gif',
      minus   : '../pic/minus.gif',
      minusBottom : '../pic/minusbottom.gif',
      nlPlus : '../pic/nolines_plus.gif',
      nlMinus : '../pic/nolines_minus.gif'
    };
    this.obj = objName;
    this.anodes = [];
    this.aIndent = [];
    this.root = new node(-1);
    this.selectednode = null;
    this.selectedFound = false;
    this.completed = false;
  };
  // Adds a new node to the node array
  tree.prototype.add = function(id, pid, name, url, title, target, icon, iconOpen, open) {
    this.anodes[this.anodes.length] = new node(id, pid, name, url, title, target, icon, iconOpen, open);
  };
  // Open all nodes
  tree.prototype.openAll = function() {
    this.oAll(true);
  };
  // Close all nodes
  tree.prototype.closeAll = function() {
    this.oAll(false);
  };
  // Outputs the tree to the page
  tree.prototype.toString = function() {
    var str = '<div class="tree">\n';
    if (document.getElementById) {
      if (this.config.useCookies) this.selectednode = this.getSelected();
      str += this.addnode(this.root);
    } else str += 'Browser not supported.';
    str += '</div>';
    if (!this.selectedFound) this.selectednode = null;
    this.completed = true;
    return str;
  };
  // Creates the tree structure
  tree.prototype.addnode = function(pnode) {
    var str = '';
    var n=0;
    if (this.config.inOrder) n = pnode._ai;
    for (n; n<this.anodes.length; n++) {
      if (this.anodes[n].pid == pnode.id) {
        var cn = this.anodes[n];
        cn._p = pnode;
        cn._ai = n;
        this.setCS(cn);
        if (!cn.target && this.config.target) cn.target = this.config.target;
        if (cn._hc && !cn._io && this.config.useCookies) cn._io = this.isOpen(cn.id);
        if (!this.config.folderLinks && cn._hc) cn.url = null;
        if (this.config.useSelection && cn.id == this.selectednode && !this.selectedFound) {
            cn._is = true;
            this.selectednode = n;
            this.selectedFound = true;
        }
        str += this.node(cn, n);
        if (cn._ls) break;
      }
    }
    return str;
  };
  // Creates the node icon, url and text
  tree.prototype.node = function(node, nodeId) {
    var str = '<div class="treenode">' + this.indent(node, nodeId);
    if (this.config.useIcons) {
      if (!node.icon) node.icon = (this.root.id == node.pid) ? this.icon.root : ((node._hc) ? this.icon.folder : this.icon.node);
      if (!node.iconOpen) node.iconOpen = (node._hc) ? this.icon.folderOpen : this.icon.node;
      if (this.root.id == node.pid) {
        node.icon = this.icon.root;
        node.iconOpen = this.icon.root;
      }
      str += '<img id="i' + this.obj + nodeId + '" src="' + ((node._io) ? node.iconOpen : node.icon) + '" alt="" />';
    }
    if (node.url) {
      str += '<a id="s' + this.obj + nodeId + '" class="' + ((this.config.useSelection) ? ((node._is ? 'nodeSel' : 'node')) : 'node') + '" href="' + node.url + '"';
      if (node.title) str += ' title="' + node.title + '"';
      if (node.target) str += ' target="' + node.target + '"';
      if (this.config.useStatusText) str += ' onmouseover="window.status=\'' + node.name + '\';return true;" onmouseout="window.status=\'\';return true;" ';
      if (this.config.useSelection && ((node._hc && this.config.folderLinks) || !node._hc))
        str += ' onclick="javascript: ' + this.obj + '.s(' + nodeId + ');"';
      str += '>';
    }
    else if ((!this.config.folderLinks || !node.url) && node._hc && node.pid != this.root.id)
      str += '<a href="javascript: ' + this.obj + '.o(' + nodeId + ');" class="node">';
    str += node.name;
    if (node.url || ((!this.config.folderLinks || !node.url) && node._hc)) str += '</a>';
    str += '</div>';
    if (node._hc) {
      str += '<div id="d' + this.obj + nodeId + '" class="clip" style="display:' + ((this.root.id == node.pid || node._io) ? 'block' : 'none') + ';">';
      str += this.addnode(node);
      str += '</div>';
    }
    this.aIndent.pop();
    return str;
  };
  // Adds the empty and line icons
  tree.prototype.indent = function(node, nodeId) {
    var str = '';
    if (this.root.id != node.pid) {
      for (var n=0; n<this.aIndent.length; n++)
        str += '<img src="' + ( (this.aIndent[n] == 1 && this.config.useLines) ? this.icon.line : this.icon.empty ) + '" alt="" />';
      (node._ls) ? this.aIndent.push(0) : this.aIndent.push(1);
      if (node._hc) {
        str += '<a href="javascript: ' + this.obj + '.o(' + nodeId + ');"><img id="j' + this.obj + nodeId + '" src="';
        if (!this.config.useLines) str += (node._io) ? this.icon.nlMinus : this.icon.nlPlus;
        else str += ( (node._io) ? ((node._ls && this.config.useLines) ? this.icon.minusBottom : this.icon.minus) : ((node._ls && this.config.useLines) ? this.icon.plusBottom : this.icon.plus ) );
        str += '" alt="" /></a>';
      } else str += '<img src="' + ( (this.config.useLines) ? ((node._ls) ? this.icon.joinBottom : this.icon.join ) : this.icon.empty) + '" alt="" />';
    }
    return str;
  };
  // Checks if a node has any children and if it is the last sibling
  tree.prototype.setCS = function(node) {
    var lastId;
    for (var n=0; n<this.anodes.length; n++) {
      if (this.anodes[n].pid == node.id) node._hc = true;
      if (this.anodes[n].pid == node.pid) lastId = this.anodes[n].id;
    }
    if (lastId==node.id) node._ls = true;
  };
  // Returns the selected node
  tree.prototype.getSelected = function() {
    var sn = this.getCookie('cs' + this.obj);
    return (sn) ? sn : null;
  };
  // Highlights the selected node
  tree.prototype.s = function(id) {
    if (!this.config.useSelection) return;
    var cn = this.anodes[id];
    if (cn._hc && !this.config.folderLinks) return;
    if (this.selectednode != id) {
      if (this.selectednode || this.selectednode==0) {
        eOld = document.getElementById("s" + this.obj + this.selectednode);
        eOld.className = "node";
      }
      eNew = document.getElementById("s" + this.obj + id);
      eNew.className = "nodeSel";
      this.selectednode = id;
      if (this.config.useCookies) this.setCookie('cs' + this.obj, cn.id);
    }
  };
  // Toggle Open or close
  tree.prototype.o = function(id) {
    var cn = this.anodes[id];
    this.nodeStatus(!cn._io, id, cn._ls);
    cn._io = !cn._io;
    if (this.config.closeSameLevel) this.closeLevel(cn);
    if (this.config.useCookies) this.updateCookie();
  };
  // Open or close all nodes
  tree.prototype.oAll = function(status) {
    for (var n=0; n<this.anodes.length; n++) {
      if (this.anodes[n]._hc && this.anodes[n].pid != this.root.id) {
        this.nodeStatus(status, n, this.anodes[n]._ls)
        this.anodes[n]._io = status;
      }
    }
    if (this.config.useCookies) this.updateCookie();
  };
  // Opens the tree to a specific node
  tree.prototype.openTo = function(nId, bSelect, bFirst) {
    if (!bFirst) {
      for (var n=0; n<this.anodes.length; n++) {
        if (this.anodes[n].id == nId) {
          nId=n;
          break;
        }
      }
    }
    var cn=this.anodes[nId];
    if (cn.pid==this.root.id || !cn._p) return;
    cn._io = true;
    cn._is = bSelect;
    if (this.completed && cn._hc) this.nodeStatus(true, cn._ai, cn._ls);
    if (this.completed && bSelect) this.s(cn._ai);
    else if (bSelect) this._sn=cn._ai;
    this.openTo(cn._p._ai, false, true);
  };
  // Closes all nodes on the same level as certain node
  tree.prototype.closeLevel = function(node) {
    for (var n=0; n<this.anodes.length; n++) {
      if (this.anodes[n].pid == node.pid && this.anodes[n].id != node.id && this.anodes[n]._hc) {
        this.nodeStatus(false, n, this.anodes[n]._ls);
        this.anodes[n]._io = false;
        this.closeAllChildren(this.anodes[n]);
      }
    }
  }
  // Closes all children of a node
  tree.prototype.closeAllChildren = function(node) {
    for (var n=0; n<this.anodes.length; n++) {
      if (this.anodes[n].pid == node.id && this.anodes[n]._hc) {
        if (this.anodes[n]._io) this.nodeStatus(false, n, this.anodes[n]._ls);
        this.anodes[n]._io = false;
        this.closeAllChildren(this.anodes[n]);    
      }
    }
  }
  // Change the status of a node(open or closed)
  tree.prototype.nodeStatus = function(status, id, bottom) {
    eDiv  = document.getElementById('d' + this.obj + id);
    eJoin  = document.getElementById('j' + this.obj + id);
    if (this.config.useIcons) {
      eIcon  = document.getElementById('i' + this.obj + id);
      eIcon.src = (status) ? this.anodes[id].iconOpen : this.anodes[id].icon;
    }
    eJoin.src = (this.config.useLines)?
    ((status)?((bottom)?this.icon.minusBottom:this.icon.minus):((bottom)?this.icon.plusBottom:this.icon.plus)):
    ((status)?this.icon.nlMinus:this.icon.nlPlus);
    eDiv.style.display = (status) ? 'block': 'none';
  };
  // [Cookie] Clears a cookie
  tree.prototype.clearCookie = function() {
    var now = new Date();
    var yesterday = new Date(now.getTime() - 1000 * 60 * 60 * 24);
    this.setCookie('co'+this.obj, 'cookieValue', yesterday);
    this.setCookie('cs'+this.obj, 'cookieValue', yesterday);
  };
  // [Cookie] Sets value in a cookie
  tree.prototype.setCookie = function(cookieName, cookieValue, expires, path, domain, secure) {
    document.cookie =
      escape(cookieName) + '=' + escape(cookieValue)
      + (expires ? '; expires=' + expires.toGMTString() : '')
      + (path ? '; path=' + path : '')
      + (domain ? '; domain=' + domain : '')
      + (secure ? '; secure' : '');
  };
  // [Cookie] Gets a value from a cookie
  tree.prototype.getCookie = function(cookieName) {
    var cookieValue = '';
    var posName = document.cookie.indexOf(escape(cookieName) + '=');
    if (posName != -1) {
      var posValue = posName + (escape(cookieName) + '=').length;
      var endPos = document.cookie.indexOf(';', posValue);
      if (endPos != -1) cookieValue = unescape(document.cookie.substring(posValue, endPos));
      else cookieValue = unescape(document.cookie.substring(posValue));
    }
    return (cookieValue);
  };
  // [Cookie] Returns ids of open nodes as a string
  tree.prototype.updateCookie = function() {
    var str = '';
    for (var n=0; n<this.anodes.length; n++) {
      if (this.anodes[n]._io && this.anodes[n].pid != this.root.id) {
        if (str) str += '.';
        str += this.anodes[n].id;
      }
    }
    this.setCookie('co' + this.obj, str);
  };
  // [Cookie] Checks if a node id is in a cookie
  tree.prototype.isOpen = function(id) {
    var aOpen = this.getCookie('co' + this.obj).split('.');
    for (var n=0; n<aOpen.length; n++)
      if (aOpen[n] == id) return true;
    return false;
  };
  // If Push and pop is not implemented by the browser
  if (!Array.prototype.push) {
    Array.prototype.push = function array_push() {
      for(var i=0;i<arguments.length;i++)
        this[this.length]=arguments[i];
      return this.length;
    }
  };
  if (!Array.prototype.pop) {
    Array.prototype.pop = function array_pop() {
      lastElement = this[this.length-1];
      this.length = Math.max(this.length-1,0);
      return lastElement;
    }
  };
