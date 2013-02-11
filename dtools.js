//Rectangle Tool
function rect_tool(id){
	this.paper = Raphael(id,"100%","100%");
	this.create = rect_create;
	this.update = rect_update;
	this.move = rect_move;
	this.start = rect_start;
	this.stop = rect_stop;
	this.remove = rect_delete;
	this.div_id = id; //id without the #
	this.click = false;
	this.drawn = false;
	this.empty = true;
		
	$("#"+id).mousedown(this,function(e){
		if(e.data.empty === true){
			e.data.create(e);
			e.data.empty = false;
		}
		e.data.click = true;
	}).mouseup(this,function(e){
		//console.log("mouse up!");
		e.data.click = false;
		e.data.drawn = true;
	}).mouseleave(this,function(e){
		//disabled becuase of IE bug which thinks
		//hitting raphael objects is a mouseleave
		//console.log("mouse Leave!");
		//e.data.click = false;
		//e.data.drawn = true;
	}).mousemove(this,function(e){
		if(e.data.click === true && e.data.drawn == false){
		    //e.offsetX = undefined workaround for FF
		    //DOES NOT TAKE INTO ACCOUNT BORDERS OFFSET
		    //IF BORDER IS LARGE, THE DRAWINGS WILL BE OFF (FIXED)
		    if(!e.offsetX){
		        var bord=document.getElementById("rect").style.border;
		        var bordpx=parseInt(bord);
			e.offsetX = (e.pageX - $(e.delegateTarget).position().top-bordpx);
			e.offsetY = (e.pageY - $(e.delegateTarget).position().top-bordpx);
		    }
		    e.data.update(e.data.rectX,e.data.rectY,e.offsetX,e.offsetY);
		}
	});
};
function rect_create(e){
	this.rect = this.paper.rect(0,0,0,0);
	this.rect.attr({
		"stroke-width":3,
		"stroke-opacity":1,
		"fill-opacity":0,
		"fill":"white"
	});
	this.rect.drag(this.move, this.start, this.stop, this, this, this);
	//e.offsetX = undefined workaround for FF
	//DOES NOT TAKE INTO ACCOUNT BORDERS OFFSET
	//IF BORDER IS LARGE, THE DRAWINGS WILL BE OFF (FIXED)
	if(!e.offsetX){
	    var bord=document.getElementById("rect").style.border;
        var bordpx=parseInt(bord);
	e.offsetX = (e.pageX - $(e.delegateTarget).position().top-bordpx);
	e.offsetY = (e.pageY - $(e.delegateTarget).position().top-bordpx);
	}
	this.rectX = e.offsetX;
	this.rectY = e.offsetY;
}
function rect_update(startX, startY, endX, endY){
	this.rect.attr({
		x: Math.min(startX, endX),
		y: Math.min(startY, endY),
		width: Math.abs(endX-startX),
		height: Math.abs(endY-startY),
	});
}
function rect_start(){
	this.rect.ox = this.rect.attr("x");
	this.rect.oy = this.rect.attr("y");
	this.rect.animate({opacity:.25},500,"<>");
};
function rect_move(dx,dy){
	this.rect.attr({
	x: this.rect.ox+dx,
	y: this.rect.oy+dy
	});
};
function rect_stop(){
	this.rect.animate({opacity: 1}, 500, "<>");
};
function rect_delete(){
	this.rect.remove();
	this.empty = true;
	this.drawn = false;
}

//Ellipse Tool
function ellipse_tool(id){
	this.paper = Raphael(id,"100%","100%");
	this.create = ellipse_create;
	this.update = ellipse_update;
	this.move = ellipse_move;
	this.start = ellipse_start;
	this.stop = ellipse_stop;
	this.remove = ellipse_delete;
	this.click = false;
	this.drawn = false;
	this.empty = true;

	$("#"+id).mousedown(this,function(e){
		if(e.data.empty === true){
			e.data.create(e);
			e.data.empty = false;
		}
		e.data.click = true;
	}).mouseup(this, function(e){
		e.data.click = false;
		e.data.drawn = true;
	}).mouseleave(this, function(e){
		//disabled becuase of IE bug which thinks
		//hitting objects is a mouseleave
		//e.data.click = false;
		//e.data.drawn = true;
	}).mousemove(this, function(e){
	    if(e.data.click === true && e.data.drawn === false){
		//e.offsetX = undefined workaround for FF
		//DOES NOT TAKE INTO ACCOUNT BORDERS OFFSET
		//IF BORDER IS LARGE, THE DRAWINGS WILL BE OFF (FIXED)
		if(!e.offsetX){
		    var bord=document.getElementById("ellipse").style.border;
	        var bordpx=parseInt(bord);
		    e.offsetX = (e.pageX - $(e.delegateTarget).position().top-bordpx);
		    e.offsetY = (e.pageY - $(e.delegateTarget).position().top-bordpx);
		}
		e.data.update(e.data.startX, e.data.startY, e.offsetX, e.offsetY);
	    }
	});
};
function ellipse_create(e){
	this.ellipse = this.paper.ellipse(0,0,0,0);
	this.ellipse.attr({
		"stroke-width": 3,
		"stroke-opacity": 1,
		"fill-opacity": 0,
		"fill":"white"
	});
	this.ellipse.drag(this.move, this.start, this.stop, this, this, this);
	//e.offsetX = undefined workaround for FF
	//DOES NOT TAKE INTO ACCOUNT BORDERS OFFSET
	//IF BORDER IS LARGE, THE DRAWINGS WILL BE OFF (FIXED)
	if(!e.offsetX){
	    var bord=document.getElementById("ellipse").style.border;
        var bordpx=parseInt(bord);
	    e.offsetX = (e.pageX - $(e.delegateTarget).position().top-bordpx);
	    e.offsetY = (e.pageY - $(e.delegateTarget).position().top-bordpx);
	}
	this.startX = e.offsetX;
	this.startY = e.offsetY;
};
function ellipse_update(startX, startY, endX, endY){
	this.ellipse.attr({
		cx: (startX+endX)/2,
		cy: (startY+endY)/2,
		rx: Math.abs(endX-startX)/2,
		ry: Math.abs(endY-startY)/2
	});
};
function ellipse_start(){
	this.ellipse.ox = this.ellipse.attr("cx");
	this.ellipse.oy = this.ellipse.attr("cy");
	this.ellipse.animate({opacity: .25}, 500, ">");
};
function ellipse_move(dx,dy){
	this.ellipse.attr({
		cx: this.ellipse.ox + dx,
		cy: this.ellipse.oy + dy
	});
};
function ellipse_stop(){
	this.ellipse.animate({opacity:1},500,">");
   	};
function ellipse_delete(){
	this.ellipse.remove();
	this.empty = true;
	this.drawn = false;
};

//Pen Tool
function pen_tool(id){
	this.paper = Raphael(id,"100%","100%");
	this.ml = [];
	this.xy = [];
	this.pathObjects = [];
	this.pathArray = [];
	this.paths = '';
	this.eraser_range = 10;
	this.pen_down = pen_down;
	this.pen_move = pen_move;
	this.erase = pen_erase;
	this.draw = pen_draw;
	this.remove = pen_clear;
	this.click = false;
	this.erase_mode = false;
  	
	$("#"+id).mousedown(this,function(e){
		if(e.data.erase_mode){
		    //e.offsetX = undefined workaround for FF
		    //DOES NOT TAKE INTO ACCOUNT BORDERS OFFSET
		    //IF BORDER IS LARGE, THE DRAWINGS WILL BE OFF (FIXED)
		    if(!e.offsetX){
		    var bord=document.getElementById("pen").style.border;
		    var bordpx=parseInt(bord);
			e.offsetX = (e.pageX - $(e.delegateTarget).position().top-bordpx);
			e.offsetY = (e.pageY - $(e.delegateTarget).position().top-bordpx);
		    }
		    e.data.erase([e.offsetX,e.offsetY]);
		}
		else{
		    e.data.pen_down(e);
		}	
		e.data.click = true;
	}).mouseup(this,function(e){
		e.data.click = false;
	}).mouseleave(this,function(e){
		e.data.click = false;
	}).mousemove(this, function(e){
		if(e.data.click === true){
			if(e.data.erase_mode == true){
			    //e.offsetX = undefined workaround for FF
			    //DOES NOT TAKE INTO ACCOUNT BORDERS OFFSET
			    //IF BORDER IS LARGE, THE DRAWINGS WILL BE OFF (FIXED)
			    if(!e.offsetX){
			    var bord=document.getElementById("pen").style.border;
    		    var bordpx=parseInt(bord);
    			e.offsetX = (e.pageX - $(e.delegateTarget).position().top-bordpx);
    			e.offsetY = (e.pageY - $(e.delegateTarget).position().top-bordpx);
			    }
			    e.data.erase([e.offsetX,e.offsetY]);
			}
			else{
				e.data.pen_move(e)
			}
		}
	});
};
  
function pen_down(e){
	e.data.ml.push('M');
	//e.offsetX = undefined workaround for FF
	//DOES NOT TAKE INTO ACCOUNT BORDERS OFFSET
	//IF BORDER IS LARGE, THE DRAWINGS WILL BE OFF (FIXED)
	if(!e.offsetX){
	    var bord=document.getElementById("pen").style.border;
        var bordpx=parseInt(bord);
	e.offsetX = (e.pageX - $(e.delegateTarget).position().top-bordpx);
	e.offsetY = (e.pageY - $(e.delegateTarget).position().top-bordpx);
	}	
	e.data.xy.push([e.offsetX,e.offsetY]);
}
function pen_move(e){
	//e.offsetX = undefined workaround for FF
	//DOES NOT TAKE INTO ACCOUNT BORDERS OFFSET
	//IF BORDER IS LARGE, THE DRAWINGS WILL BE OFF (FIXED)
	if(!e.offsetX){
	        var bord=document.getElementById("pen").style.border;
	        var bordpx=parseInt(bord);
		e.offsetX = (e.pageX - $(e.delegateTarget).position().top-bordpx);
		e.offsetY = (e.pageY - $(e.delegateTarget).position().top-bordpx);
	}
	e.data.ml.push('L');
	e.data.xy.push([e.offsetX,e.offsetY]);
	e.data.draw();
}
  
function pen_draw(){
	//removes all paths
	var len = this.pathObjects.length;
	for(var i = 0; i < len; i++){
		this.pathObjects[i].remove();
	}
	for(var i = 0; i < len; i++){
		this.pathObjects.shift();
	}
	this.paths = '';
	//console.log(this.pathObjects.length);
	//console.log("removed old objects");
  	
	//takes ml and xy and turns into large string (paths)
	for(var i = 0; i < this.ml.length; i++){
		this.paths += this.ml[i] + this.xy[i][0] + ',' + this.xy[i][1];
	}
	//console.log("turned into string");
	//splits large string into array of path-strings
	if(this.paths.length > 0){
		this.pathArray = this.paths.split('M')
	}
	//console.log("split into paths");
	for(var i = 1; i < this.pathArray.length; i++){
		this.pathObjects[i-1] = this.paper.path('M'+this.pathArray[i]);
		this.pathObjects[i-1].attr({
			"stroke-width": 3,
			"stroke-opacity": 1,
			"stroke-linejoin":"round",
			"stroke-linecap":"round"
		})
	}
}    
function pen_erase(location){
	//eraser size
	for(var i= 0; i < this.xy.length;i++){
		if(location[0] - this.eraser_range <= this.xy[i][0] && this.xy[i][0] <= location[0] + this.eraser_range){
			if(location[1] - this.eraser_range <= this.xy[i][1] && this.xy[i][1] <= location[1] + this.eraser_range){
				//console.log("Match Found");
				if(this.ml[i+1] === 'L'){
					this.ml[i+1] = 'M';
				}
				this.ml.splice(i,1);
				this.xy.splice(i,1);
				this.draw();
			}
		}
	}
}
function pen_clear(){
	var len = this.pathObjects.length;
	for(var i = 0; i < len; i++){
		this.pathObjects[i].remove();
	}
	for(var i = 0; i < len; i++){
		this.pathObjects.shift();
	}
	this.paths = '';
	this.pathArray = [];
	this.ml = [];
	this.xy = [];
	this.draw()
}
