var z = 20,
    deskW = 2.5,
    deskH = 4,
    desks = [],
    mode = 0,
    cx = 0,
    cy = 0,
    addArmed = false,
    mx,
    my,
    ox,
    oy,
    dragV = 0,
    sel = -1,
    od;

document.getElementById('scale').style.width = 6 * z;

function saveDesksToDB() {
    var teacherId = document.getElementById('teacherID').value;
    var layoutId = document.getElementById('layouts').value == 'new' ? prompt('Enter layout ID:', '') : document.getElementById('layouts').value;
    saveLayout(teacherId, layoutId, desks);
    getTeacherInfo(teacherId, true);
}

function updateMenu(menuId) {
    var menu = document.getElementById(menuId),
        layouts = Object.keys(currentTeacherInfo),
        selected = menu.value;
    menu.innerHTML = '<option value="new" selected>+ New Layout</option>';
    for (var i = 0; i < layouts.length; i++) {
        var isSelected = selected == layouts[i];
        menu.innerHTML += '<option value="' + layouts[i] + '"' + (isSelected ? 'selected' : '') + '>' + layouts[i] + '</option>';
    }
}

function onSelectChange() {
    var selection = document.getElementById('layouts').value;
    if (selection == 'new') {
        desks = [];
        document.getElementById('layout').innerHTML = '';
    } else {
        importAll(currentTeacherInfo[selection].desks);
    }
}

function exportAll() {
    return desks;
}
function importAll(a) {
    desks = [];
    sel = -1;
    document.getElementById('layout').innerHTML = '';
    for (var i = 0; i < a.length; i++)
        addDesk(a[i].x * z - cx, a[i].y * z - cy, a[i].width, a[i].height, a[i].rotation, Object.keys(a[i]).length > 5 ? a[i].student : '');
}
function modeT() {
    console.log(mode == 1 ? 'fill' : 'set');
    document.getElementById(mode == 0 ? 'fill' : 'set').className = 'toggleB';
    document.getElementById(mode == 1 ? 'fill' : 'set').className = 'toggleB selected';
    mode = (mode + 1) % 2;
    document.getElementById('edittools').style.display = mode == 1 ? 'block' : 'none';
    if (mode == 0) importAll(exportAll());
}
function generateGrid(nx, ny, dx, dy) {
    var s = '[';
    for (var i = 0; i < nx; i++)
        for (var j = 0; j < ny; j++) s += ',[' + i * (dx + deskW) + ',' + j * (dy + deskH) + ',' + deskW + ',' + deskH + ',0]';
    return s.replace('[,', '[') + ']';
}
function armAdd() {
    addArmed = !addArmed;
    document.getElementById('daInd').className = addArmed ? 'selected' : '';
}
function dsFormat() {
    var c = ('' + prompt('Enter a desk size in terms of Length x Width feet (ex: 4x2.5)')).match(/[\d.]+/g);
    if (c == null || c.length != 2) {
        alert('input error');
        return;
    }
    deskH = parseFloat(c[0]);
    deskW = parseFloat(c[1]);
}

function populate(a) {
    b = document.getElementById('desk' + a);
    var student = prompt('Enter student name:' + (desks[a].student == '' ? '' : '\n(currently: ' + b.innerHTML.match(/(?<=<p>)[^<]*/)[0] + ')'));
    if (student == null) return;
    desks[a].student = student;
    if (!b.className.match('seldesk')) b.className += ' seldesk';
    b.innerHTML = b.innerHTML.replace(/(?<=<p>)[^<]*/, student);
}
function addDesk(x, y, w, h, r, d) {
    //x and y are screen coordinates, not actual coordinates
    var n = desks.length;
    document.getElementById('layout').innerHTML += "<div class='desk" + (d == '' ? '' : ' seldesk') + "' id='desk" + n + "'><p>" + d + '</p></desk>';
    var a = document.getElementById('desk' + n);
    a.style.top = y - (h * z) / 2 + 'px';
    a.style.left = x - (w * z) / 2 + 'px';
    a.style.width = w * z + 'px';
    a.style.height = h * z + 'px';
    a.style.transform = 'rotate(' + r + 'deg)';
    var deskInfo = {
        x: (cx + x) / z,
        y: (cy + y) / z,
        width: w,
        height: h,
        rotation: r,
        student: d,
    };
    desks.push(deskInfo);
}
function pan(dx, dy) {
    cx -= dx;
    cy -= dy;
    var l = document.getElementsByClassName('desk');
    for (var i = 0; i < l.length; i++) {
        l[i].style.top = parseFloat(l[i].style.top.match(/-?[\d.]+/, 'g')[0]) + dy + 'px';
        l[i].style.left = parseFloat(l[i].style.left.match(/-?[\d.]+/, 'g')[0]) + dx + 'px';
    }
    ox = mx;
    oy = my;
}
function zoom(zi) {
    //hw and hh define the point of screen zoomed out around.
    //I set to center, for scroll wheel implimentation, set to cursor position
    var hw = window.innerWidth / 2;
    var hh = window.innerHeight / 2;
    var l = document.getElementsByClassName('desk');
    for (var i = 0; i < l.length; i++) {
        l[i].style.top = zi * (parseFloat(l[i].style.top.match(/-?[\d.]+/, 'g')[0]) - hh) + hh + 'px';
        l[i].style.left = zi * (parseFloat(l[i].style.left.match(/-?[\d.]+/, 'g')[0]) - hw) + hw + 'px';
        l[i].style.width = zi * parseFloat(l[i].style.width.match(/-?[\d.]+/, 'g')[0]) + 'px';
        l[i].style.height = zi * parseFloat(l[i].style.height.match(/-?[\d.]+/, 'g')[0]) + 'px';
    }
    z *= zi;
    cx = zi * (cx + hw) - hw;
    cy = zi * (cy + hh) - hh;
    document.getElementById('scale').style.width = 6 * z;
}

function dSel() {
    document.getElementById('rotator').remove();
    document.getElementById('mover').remove();
    document.getElementById('desk' + sel).style.border = '3px solid black';
    sel = -1;
}
function setSel(i) {
    if (sel != -1) dSel();
    document.getElementById('desk' + i).innerHTML += "<div id='rotator'></div><div id='mover'></div>";
    document.getElementById('desk' + i).style.border = '3px solid blue';
    sel = i;
}
function selatan() {
    a = document.getElementById('desk' + sel);
    x = mx - parseInt(a.style.left) - parseInt(a.style.width) / 2 + 0.01;
    y = parseInt(a.style.top) + parseInt(a.style.height) / 2 + 0.01 - my;
    return (180 * Math.atan(y / x)) / Math.PI - (x > 0 ? 0 : 180);
}
function selmove() {
    l = document.getElementById('desk' + sel);
    l.style.top = parseFloat(l.style.top.match(/-?[\d.]+/, 'g')[0]) + (my - oy) + 'px';
    l.style.left = parseFloat(l.style.left.match(/-?[\d.]+/, 'g')[0]) + (mx - ox) + 'px';
    desks[sel].x += (mx - ox) / z;
    desks[sel].y += (my - oy) / z;
    ox = mx;
    oy = my;
}

window.addEventListener('mousedown', (e) => {
    //console.log(e.target.id);
    if (mode == 1) {
        //yes, I could have used a few less lines by integrating the two modes together
        //however, it's 1:30 and I don't want to change stuff, so I shoved it into this if
        if (e.target.id.match(/desk/, '')) {
            if (sel != e.target.id.match(/\d+/, '')[0]) setSel(e.target.id.match(/\d+/, '')[0]);
            dragV = 2;
        } else if (e.target.id == 'rotator') {
            od = parseFloat(document.getElementById('desk' + sel).style.transform.match(/[\d.]+/, '')[0]) + selatan();
            dragV = 3;
        } else if (e.target.id == 'mover') {
            dragV = 4;
        } else {
            if (addArmed) {
                addDesk(mx, my, deskW, deskH, 0, '');
                dragV = 2;
                armAdd();
            }
            if (sel != -1) {
                dSel();
            }
        }
    } else if (e.target.id.match(/desk/, '')) {
        populate(parseInt(e.target.id.match(/\d+/, '')[0]));
        dragV = 2;
    }

    ox = e.clientX;
    oy = e.clientY;
    dragV = dragV == 0 ? 1 : dragV;
});
window.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    if (dragV == 1) pan(e.clientX - ox, e.clientY - oy);
    if (dragV == 3) {
        document.getElementById('desk' + sel).style.transform = 'rotate(' + (od - selatan()) + 'deg)';
        desks[sel].rotation = od - selatan();
    }
    if (dragV == 4) selmove();
});
window.addEventListener('mouseup', (e) => {
    dragV = 0;
});
window.addEventListener('keydown', (e) => {
    if (e.key == 'n' && mode == 1) addDesk(mx, my, deskW, deskH, 0, '');
    if ((e.key == 'Backspace' || e.key == 'Delete') && sel != -1 && mode == 1) {
        document.getElementById('desk' + sel).remove();
        desks.pop(sel);
        sel = -1;
    }
});
