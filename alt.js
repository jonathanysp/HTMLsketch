window.onload = load;
var paper;
var iA;
var mode=1;
var click;
var ml=[];
var xy=[];
var paths=[];
var pathObjects=[];
var strokeWidth=10;
var opacity=1;
var marquees=[];
var marquees_on=1;
var currpaths=""; //this will be the string representing all of our paths
	                 //to get the paths individually, split at 'M'
var pathattrs="";
var datastring="";

var originalHeight, originalWidth;

//if the pointer icon is clicked, switch to default mode (0)
//if the pen icon is clicked, switch to pen mode (1)
//if the eraser icon is clicked, switch to eraser mode (2)

function abs_dims(rel_dim,canv_dim)
{
	return parseFloat(rel_dim)*canv_dim;
}

function add_attributes(elt,fillColor,fillOpacity,strokeColor,strokeOpacity,strokeWidth)
{
    //var strokewidth=document.getElementById("strokewidth");
    //var strokecolor=document.getElementById("strokecolor");
    //var fillcolor=document.getElementById("fillcolor");
    //var fillopacity=document.getElementById("fillopacity");
    //$("#canvas").mousedown();
    var canv=document.getElementById("inkCanv");
    var gl;
    var resize=0; //if 1, we are in zoom mode rather than pan mode
    var noglow=1; //if 1, glowing is disabled
    var origmousex;
    var origmousey;
    
    if(fillColor==undefined)
        fillColor=iA.shapeFillColor;//"#"+document.getElementById("shape_fill_color").value;
    if(fillOpacity==undefined)
        fillOpacity=iA.shapeFillOpacity;//document.getElementById("shape_fill_opacity").value;
    if(strokeColor==undefined)
        strokeColor=iA.shapeStrokeColor;//"#"+document.getElementById("shape_stroke_color").value;
    if(strokeOpacity==undefined)
        strokeOpacity=iA.shapeStrokeOpacity;//document.getElementById("shape_stroke_opacity").value;
    if(strokeWidth==undefined)
        strokeWidth=iA.shapeStrokeWidth;//document.getElementById("shape_stroke_width").value;
        
    elt.mouseover(function(){
        if(!noglow && (mode==0))
        {
            gl=elt.glow({"width":15,"color":"#33ff00","opacity":0.8});
        }
    })
    elt.mouseout(function(){
        gl.remove();
    })
    elt.attr({
        "stroke-width":strokeWidth,
        "stroke":strokeColor,
        "stroke-opacity":strokeOpacity,
        "fill":fillColor,
        "fill-opacity":fillOpacity
    });
    
    //drag(move, start, stop,...)
    elt.drag(function(dx,dy,mousex,mousey){
        if(!mode)
        {
            this.toFront();
	        if(!resize)
	        {
	            //drag an element
	            var currx=parseInt(this.data("currx"));//x position at the start of drag
		        var curry=parseInt(this.data("curry"));
    		    var xpos=currx+dx; //to get new x position, just add dx
    		    var ypos=curry+dy;
		        this.attr({
		            cx:xpos+parseInt(this.data("curr_rx")), //xcenter is left+xradius
		            cy:ypos+parseInt(this.data("curr_ry")), //ycenter is top+yradius
		            x:xpos,
		            y:ypos
		        });
		    }
		    else
		    {
		        //resize an element
		        var bbox=this.getBBox();
				document.getElementById("test_layers_div").innerHTML="bbox: x="+bbox.x+", y="+bbox.y+", w="+bbox.width+", h="+bbox.height;
		        this.attr({
		            cx:bbox.x+bbox.width*0.5+(mousex-origmousex)*0.5,
		            cy:bbox.y+bbox.height*0.5+(mousey-origmousey)*0.5,
		            rx:bbox.width/2.0+(mousex-origmousex)*0.5,
		            ry:bbox.height/2.0+(mousey-origmousey)*0.5,
		            width:bbox.width+mousex-origmousex,
		            height:bbox.height+mousey-origmousey
		        });
		    }
		    origmousex=mousex;
		    origmousey=mousey;
	    }
    },function(x,y){
        if(!mode)
        {
            origmousex=x;
	        origmousey=y;
	        var bbox=this.getBBox();
	        resize=0;
	        var canvx=parseInt($("#inkCanv").css("left"));
	        var canvbx=parseInt($("#inkCanv").css("border-left"));
	        var canvy=parseInt($("#inkCanv").css("top"));
	        var canvby=parseInt($("#inkCanv").css("border-top"));
	        
	        // document.getElementById("test_layers_div").innerHTML="x = "+x+"<br /> \
	        //                    relevant x = "+(bbox.x+bbox.width+canvx+canvbx)+"<br /> y = "+y+"<br /> \
	        //                    relevant y = "+(bbox.y+bbox.height+canvy+canvby)+"<br /> canvx = "+canvx+"\
	        //                    <br /> canvbx = "+canvbx+"<br /> canvy = "+canvy+"\
	        //                    <br /> canvby = "+canvby;
	        if((x>(bbox.x+bbox.width*0.5+canvx+canvbx)) && (y>(bbox.y+bbox.height*0.5+canvy+canvby)))
            {
                resize=1;
            }
			
	        gl.remove();
	        noglow=1;
	        this.animate({opacity:.25},500,"<>");
        }
    },function(){
        if(!mode)
        {
            this.data("currx",this.getBBox().x); //reset data using bounding box coords
	        this.data("curry",this.getBBox().y);
	        this.data("curr_rx",this.getBBox().width/2.0);
	        this.data("curr_ry",this.getBBox().height/2.0);
	        //noglow=0;
	        resize=0;
	        this.animate({opacity:1},500,"<>");
        }
    });   
}

function add_ellipse()
{
    set_mode(0);
	var w=parseInt($('#inkCanv').css("width"));
    var h=parseInt($('#inkCanv').css("height"));
	var x=Math.floor(Math.random()*w);
    var y=Math.floor(Math.random()*h);
	var rx=Math.floor(Math.random()*(w-x-1));
	var ry=Math.floor(Math.random()*(h-y-1));
    ellipse=paper.ellipse(x,y,rx,ry);
    ellipse.data("currx",ellipse.getBBox().x);
    ellipse.data("curry",ellipse.getBBox().y);
    ellipse.data("curr_rx",rx);
    ellipse.data("curr_ry",ry);
    ellipse.data("type","ellipse");
    add_attributes(ellipse);
}

function add_marq_attributes(marq,marqFillColor,marqFillOpacity)
{
    var elt=marq.rc;
    var canv=document.getElementById("inkCanv");
    var gl;
    var resize=0; //if 1, we are in zoom mode rather than pan mode
    var noglow=0; //if 1, glowing is disabled
    var origmousex;
    var origmousey;
    var w=parseInt($('#inkCanv').css("width"));
    var h=parseInt($('#inkCanv').css("height"));
    if(marqFillColor==undefined)
        marqFillColor="#"+document.getElementById("marq_color").value;
    if(marqFillOpacity==undefined)
        marqFillOpacity=document.getElementById("marq_opacity").value;
    
    elt.mouseover(function(){
        if(!noglow && (mode==3))
        {
            gl=elt.glow({"width":10,"color":"#33ff00","opacity":.8});
        }
    });
    elt.mouseout(function(){
        gl.remove();
    });
    elt.attr({
        "stroke-width":0,
        "stroke":"#222222",
        "fill":"#ffffff",
        "fill-opacity":"0"
    });
    elt.data("surr-fill",marqFillColor);
    elt.data("surr-opac",marqFillOpacity);
    var mset=paper.set();
    mset.push(marq.rn,marq.re,marq.rs,marq.rw);
    mset.attr({
        "stroke-width":0,
        "stroke":"#222222",
        "fill":marqFillColor,
        "fill-opacity":marqFillOpacity
    });
    
    
    //drag(move, start, stop,...)
    elt.drag(function(dx,dy,mousex,mousey){
		w=parseInt($('#inkCanv').css("width"));
	    h=parseInt($('#inkCanv').css("height"));
        //onmove
        if(mode==3)
        {
            this.toFront();
            var bbox=this.getBBox();
	        if(!resize)
	        {
	            //drag an marquee -- need to update all relevant rectangles
	            var currx=parseInt(this.data("currx"));//x position at the start of drag
		        var curry=parseInt(this.data("curry"));
    		    var xpos=currx+dx; //to get new x position, just add dx
    		    var ypos=curry+dy;
		        this.attr({
		            x:xpos,
		            y:ypos
		        });
		        marq.rn.attr({
		            height:ypos
		        });
		        marq.re.attr({
		            x:xpos+bbox.width,
		            y:ypos,
		            width:w-(xpos+bbox.width),
		            height:bbox.height
		        });
		        marq.rs.attr({
		            y:ypos+bbox.height,
		            height:h-(ypos+bbox.height)
		        })
		        marq.rw.attr({
		            y:ypos,
		            width:xpos,
		            height:bbox.height
		        })
		        
		    }
		    else
		    {
		        //resize a marquee -- need to update all relevant rectangles
				//rs.y:bbox.y+bbox.height+mousey-origmousey,
				var X=this.attr("x");
				var Y=this.attr("y");
		        this.attr({
		            width:bbox.width+mousex-origmousex,
		            height:bbox.height+mousey-origmousey
		        });
		        marq.rs.attr({
		            y:Y+bbox.height+mousey-origmousey,
		            height:h-(bbox.y+bbox.height+mousey-origmousey)
		        });
		        marq.re.attr({
		            x:bbox.x+bbox.width+mousex-origmousex,
					y:Y,
		            width:w-(bbox.x+bbox.width+mousex-origmousex),
		            height:bbox.height+mousey-origmousey
		        })
		        marq.rw.attr({
					y:Y,
		            height:bbox.height+mousey-origmousey
		        })
		    }
		    origmousex=mousex;
		    origmousey=mousey;
	    }
    },function(x,y){
        //onstart
        if(mode==3)
        {
            origmousex=x;
	        origmousey=y;
	        var bbox=this.getBBox();
	        var canvx=parseInt($("#inkCanv").css("left"));
	        var canvbx=parseInt($("#inkCanv").css("border-left"));
	        var canvy=parseInt($("#inkCanv").css("top"));
	        var canvby=parseInt($("#inkCanv").css("border-top"));
	        //document.getElementById("test_layers_div").innerHTML="x = "+x+"<br /> bbox.x = "+(bbox.x)+"<br /> y = "+y+"<br /> bbox.y = "+(bbox.y);
	        if((x>(bbox.x+bbox.width*0.5+canvx+canvbx)) && (y>(bbox.y+bbox.height*0.5+canvy+canvby)))
            {
                resize=1;
            }
	        gl.remove();
	        noglow=1;
	        this.animate({opacity:.25},500,"<>");
        }
    },function(){
        //onend
        if(mode==3)
        {
            this.data("currx",this.getBBox().x); //reset data using bounding box coords
	        this.data("curry",this.getBBox().y);
	        marq.re.data("currx",this.getBBox().x+this.getBBox().width);
	        marq.rs.data("curry",this.getBBox().y+this.getBBox().height);
	        resize=0;
	        this.animate({opacity:1},500,"<>");
	        noglow=0;
        }
    });   
}

function add_marquee()
{
    set_mode(3);
    var topx=200+Math.floor(Math.random()*10), botx=300+Math.floor(Math.random()*10), topy=200+Math.floor(Math.random()*10), boty=300+Math.floor(Math.random()*10);
    //var topx=40, botx=80, topy=40, boty=80;
    var w=parseInt($('#inkCanv').css("width"));
    var h=parseInt($('#inkCanv').css("height"));
    var rn=paper.rect(0,0,w,topy);
    rn.data("currx",0);
    rn.data("curry",0);
	rn.data("type","marq_rect");
    var re=paper.rect(botx,topy,w-botx,boty-topy);
    re.data("currx",botx);
    re.data("curry",topy);
	re.data("type","marq_rect");
    var rs=paper.rect(0,boty,w,h-boty);
    rs.data("currx",0);
    rs.data("curry",boty);
	rs.data("type","marq_rect");
    var rw=paper.rect(0,topy,topx,boty-topy);
    rw.data("currx",0);
    rw.data("curry",topy);
	rw.data("type","marq_rect");
    var rc=paper.rect(topx,topy,botx-topx,boty-topy);
    rc.data("currx",topx);
    rc.data("curry",topy);
    rc.data("type","marquee");
    var m=new marquee(rn,re,rs,rw,rc);
    add_marq_attributes(m);
    marquees.push(m);
    show_marquees();
    marquees_on=1;
    // var elt=document.getElementById("test_layers_div");
    //             elt.innerHTML=marquees;
}

function add_rectangle()
{
    set_mode(0);
	var w=parseInt($('#inkCanv').css("width"));
    var h=parseInt($('#inkCanv').css("height"));
    var x=Math.floor(Math.random()*w);
    var y=Math.floor(Math.random()*h);
	var wid=Math.floor(Math.random()*(w-x-1));
	var hei=Math.floor(Math.random()*(h-y-1));
    rect=paper.rect(x,y,wid,hei);
    rect.data("currx",x);
    rect.data("curry",y);
    rect.data("type","rect");
    add_attributes(rect);
}

function drawPaths(paths,strokeColor,strokeOpacity,strokeWidth)
{
    if(paths==undefined)
    {
        var len = pathObjects.length;
        for(var i = 0; i < pathObjects.length; i++)
        { //removes paths from canvas
            pathObjects[i].remove();
        }
        for(var i = 0; i < len; i++)
        { //clears the pathObjects array
            pathObjects.shift();
        }
        for(var i = 0; i < ml.length; i++)
        { //constructs the path
            if(ml[i] !== 'X')
            {
                paths += ml[i] + xy[i][0] + ',' + xy[i][1];;
            }
        }
    }
    if(strokeColor==undefined)
        strokeColor=iA.penColor;//"#"+document.getElementById("pen_color").value;
    if(strokeOpacity==undefined)
        strokeOpacity=iA.penOpacity;//document.getElementById("pen_opacity").value;
    if(strokeWidth==undefined)
        strokeWidth=iA.penWidth;//document.getElementById("pen_width").value;
    //var paths;
    //removes all objects in pathObjects to be redrawn
    
    if(paths.length > 0)
    {
        var path = paths.split('M');
    }
    for(var i = 1; i < path.length; i++)
    {
        var drawing = paper.path('M'+path[i]);
        drawing.data("type","path");
        drawing.attr({
        "stroke-width":strokeWidth,
        "stroke-opacity":strokeOpacity,
        "stroke":strokeColor,
        "stroke-linejoin":"round",
        "stroke-linecap":"round"
        })
        pathObjects.push(drawing);
    }
    currpaths=paths;
    pathattrs="[stroke]"+strokeColor+"[strokeo]"+strokeOpacity+"[strokew]"+strokeWidth;
}

function erase(location)
{
    var range=parseInt(document.getElementById("eraser_width").value);
    for(var i = 0; i < xy.length; i++)
    {
        if(location[0] - range <= xy[i][0] && xy[i][0] <= location[0] + range)
        {
	        if(location[1] - range <= xy[i][1] && xy[i][1] <= location[1] + range)
	        {
	            if(ml[i+1] === 'L')
	            {
		            ml[i+1] = 'M';
	            }
	            ml.splice(i,1);
	            xy.splice(i,1);
	            drawPaths();
	        }
        }
    }
}

function hide_marquees()
{
    var i;
    var len=marquees.length;
    for(i=0;i<len;i++)
    {
        marquees[i].rn.hide();
        marquees[i].re.hide();
        marquees[i].rs.hide();
        marquees[i].rw.hide();
        marquees[i].rc.hide();
    }
}

function get_attr(str,attr,parsetype)
{
    //parse==0: return as string, parse==1: return as int, parse==2: return as float
    if(parsetype==undefined)
        parsetype="f";
        
    if(parsetype=="s")
        return str.split("["+attr+"]")[1].split("[")[0];
    else if(parsetype=="i")
        return parseInt(str.split("["+attr+"]")[1].split("[")[0]);
    else
        return parseFloat(str.split("["+attr+"]")[1].split("[")[0]);
}

function inkAuthoring(canvasId)
{
    /*
      definition of the inkAuthoring class
      members:
        paper -- a Raphael object (a canvas to draw on) fit to the div specified by canvasId
        loadInk -- loads an Ink to the canvas using the string format specified in update_datastring() below
    */
    var cw=parseInt($("#"+canvasId).css("width"));
    var ch=parseInt($("#"+canvasId).css("height"));
    this.paper=Raphael(document.getElementById(canvasId),"100%","100%");
    
    this.penColor="#000000";
    this.penOpacity=1.0;
    this.penWidth=5;
    this.eraserWidth=5;
    this.shapeStrokeColor="#000000";
    this.shapeStrokeOpacity=1.0;
    this.shapeStrokeWidth=3;
    this.shapeFillColor="#ffff00";
    this.shapeFillOpacity=0.0;
    this.marqueeFillColor="#222222";
    this.marqueeFillOpacity=0.8;
    
    this.loadInk=function(datastr){
		cw=parseInt($("#"+canvasId).css("width"));
	    ch=parseInt($("#"+canvasId).css("height"));
        var shapes=datastr.split("|");
        var i;
        for(i=0;i<shapes.length;i++)
        {
            var shape=shapes[i];
            var type=shape.split("::")[0];
            type=type.toLowerCase();
            switch(type)
            {
                case "rect":
                    //[x]73[y]196[w]187[h]201[fillc]#ffff00[fillo].5[strokec]#000000[strokeo]1[strokew]3[]
                    var x=abs_dims(get_attr(shape,"x"),cw);
                    var y=abs_dims(get_attr(shape,"y"),ch);
                    var w=abs_dims(get_attr(shape,"w"),cw);
                    var h=abs_dims(get_attr(shape,"h"),ch);

                    var fillc=get_attr(shape,"fillc","s");
                    var fillo=get_attr(shape,"fillo","f");
                    var strokec=get_attr(shape,"strokec","s");
                    var strokeo=get_attr(shape,"strokeo","f");
                    var strokew=get_attr(shape,"strokew");
                    var R=paper.rect(x,y,w,h);
                    R.data("currx",x);
                    R.data("curry",y);
                    R.data("type","rect");
                    add_attributes(R,fillc,fillo,strokec,strokeo,strokew);
                    break;
                case "ellipse":
                    //[cx]81[cy]131[rx]40[ry]27[fillc]#ffff00[fillo].5[strokec]#000000[strokeo]1[strokew]3[]
					var cx=abs_dims(get_attr(shape,"cx"),cw);
                    var cy=abs_dims(get_attr(shape,"cy"),ch);
                    var rx=abs_dims(get_attr(shape,"rx"),cw);
                    var ry=abs_dims(get_attr(shape,"ry"),ch);

                    var fillc=get_attr(shape,"fillc","s");
                    var fillo=get_attr(shape,"fillo","f");
                    var strokec=get_attr(shape,"strokec","s");
                    var strokeo=get_attr(shape,"strokeo","f");
                    var strokew=get_attr(shape,"strokew");
                    var E=paper.ellipse(cx,cy,rx,ry);
                    E.data("currx",E.getBBox().x);
                    E.data("curry",E.getBBox().y);
                    E.data("curr_rx",rx);
                    E.data("curr_ry",ry);
                    E.data("type","ellipse");
                    add_attributes(E,fillc,fillo,strokec,strokeo,strokew);
                    break;
                case "marquee":
                    //[x]206[y]207[w]102[h]93[surrfillc]#222222[surrfillo].8[]
                   // var canvw=parseInt($('#canv').css("width"));
                   // var canvh=parseInt($('#canv').css("height"));
                    var topx=abs_dims(get_attr(shape,"x"),cw);
                    var topy=abs_dims(get_attr(shape,"y"),ch);
                    var w=abs_dims(get_attr(shape,"w"),cw);
                    var h=abs_dims(get_attr(shape,"h"),ch);
                    var surrfillc=get_attr(shape,"surrfillc","s");
                    var surrfillo=get_attr(shape,"surrfillo","f");
                    //alert("surrfillc = "+surrfillc+", surrfillo = "+surrfillo);
                    var botx=topx+w;
                    var boty=topy+h;
                    var rn=paper.rect(0,0,cw,topy);
                    rn.data("currx",0);
                    rn.data("curry",0);
                    var re=paper.rect(botx,topy,cw-botx,boty-topy);
                    re.data("currx",botx);
                    re.data("curry",topy);
                    var rs=paper.rect(0,boty,cw,ch-boty);
                    rs.data("currx",0);
                    rs.data("curry",boty);
                    var rw=paper.rect(0,topy,topx,boty-topy);
                    rw.data("currx",0);
                    rw.data("curry",topy);
                    var rc=paper.rect(topx,topy,botx-topx,boty-topy);
                    rc.data("currx",topx);
                    rc.data("curry",topy);
                    rc.data("type","marquee");
                    var m=new marquee(rn,re,rs,rw,rc);
                    add_marq_attributes(m,surrfillc,surrfillo);
                    marquees.push(m);
                    show_marquees();
                    marquees_on=1;
                    break;
                case "path":
					//[pathstring]M0.588,0.572L0.588,0.572[stroke]#000000[strokeo]1[strokew]5[]
                    var pathstring=get_attr(shape,"pathstring","s");
                    var strokec=get_attr(shape,"stroke","s");
                    var strokeo=get_attr(shape,"strokeo","f");
                    var strokew=get_attr(shape,"strokew");
					//alert("pathstring = "+pathstring);
                    currpaths=transform_pathstring(pathstring,cw,ch,"round");
					document.getElementById("test_layers_div").innerHTML+="PATH TEST:::::"+currpaths;
					///alert(currpaths);
                    update_ml_xy(currpaths);
                    drawPaths(currpaths,strokec,strokeo,strokew);
                    break;
            }
        }
    };

    this.addRectangle=function(){add_rectangle();};
    this.addEllipse=function(){add_ellipse();};
    this.addMarquee=function(){add_marquee();};
    
    // allow drawing on the Raphael paper
    $("#"+canvasId).mousedown(function(e)
    {
        //alert("ml = "+ml+", xy = "+xy);
	    click = true;
	    switch(mode)
    	{
    	case 1:
    	    ml.push('M');
    	    xy.push([e.offsetX,e.offsetY]);
    	    ml.push('L'); //to allow drawing single dots
    	    xy.push([e.offsetX,e.offsetY]);
    	    drawPaths();
    	    //document.getElementById("test_layers_div").innerHTML="ml = "+ml+"<br /> xy = "+xy;
    	    break;
    	case 2:
    	    erase([e.offsetX,e.offsetY]);
    	    break;
		default:
			break;
    	}
    	//update_datastring();
    	//document.getElementById("test_layers_div").innerHTML+="<br />currpaths = "+currpaths.split("undefined")[1];
    }).mouseup(function()
    {
        click = false;
    }).mouseleave(function()
    {
     if(click === true)
     {
         click = false;
     }
    }).mousemove(function(e)
    {
        if((mode==1) || (mode==2))
        {
            $("#inkCanv").css('cursor','crosshair');
        }
        else
        {
            $("#inkCanv").css('cursor','pointer');
        }
        if(click === false)
            return;
        switch(mode)
        {
            case 1:
                ml.push('L');
                xy.push([e.offsetX,e.offsetY]);
                drawPaths();
                break;
            case 2:
                erase([e.offsetX,e.offsetY]);
                break;
        }
    }).hover(function(e)
    {
        if(mode==1)
        {
            $("#inkCanv").css('cursor', "pointer");
        }
    });
    
    this.setPenColor=function(c){this.penColor=c;};
    this.setPenOpacity=function(o){this.penOpacity=o;};
    this.setPenWidth=function(w){this.penWidth=w;};
    this.setEraserWidth=function(w){this.eraserWidth=w;};
    this.setShapeStrokeColor=function(c){this.shapeStrokeColor=c;};
    this.setShapeStrokeOpacity=function(o){this.shapeStrokeOpacity=o;};
    this.setShapeStrokeWidth=function(w){this.shapeStrokeWidth=w;};
    this.setMarqueeFillColor=function(c){this.marqueeFillColor=c;};
    this.setMarqueeFillOpacity=function(o){this.marqueeFillOpacity=o;};
    
    this.getPenColor=function(){return this.setPenColor;};
    this.getPenOpacity=function(){return this.penOpacity;};
    this.getPenWidth=function(){return this.penWidth;};
    this.getEraserWidth=function(){return this.eraserWidth;};
    this.getShapeStrokeColor=function(){return this.shapeStrokeColor;};
    this.getShapeStrokeOpacity=function(){return this.shapeStrokeOpacity;};
    this.getShapeStrokeWidth=function(){return this.shapeStrokeWidth;};
    this.getMarqueeFillColor=function(){return this.marqueeFillColor;};
    this.getMarqueeFillOpacity=function(){return this.marqueeFillOpacity;};
    
    this.updatePenColor=function(id)
    {
        var val=document.getElementById(id).value;
        if(val.length==6)
            this.penColor="#"+val;
    }
    this.updatePenOpacity=function(id)
    {
        var val=document.getElementById(id).value;
        if(val!=undefined)
            this.penOpacity=val;
    }
    this.updatePenWidth=function(id)
    {
        var val=document.getElementById(id).value;
        if(val!=undefined)
            this.penWidth=val;
    }
    this.updateShapeStrokeColor=function(id)
    {
        var val=document.getElementById(id).value;
        if(val.length==6)
        {
            this.shapeStrokeColor="#"+val;
        }
    }
    this.updateShapeStrokeOpacity=function(id)
    {
        var val=document.getElementById(id).value;
        if(val!=undefined)
            this.shapeStrokeOpacity=val;
    }
    this.updateShapeStrokeWidth=function(id)
    {
        var val=document.getElementById(id).value;
        if(val!=undefined)
            this.shapeStrokeWidth=val;
    }
    this.updateShapeFillColor=function(id)
    {
        var val=document.getElementById(id).value;
        if(val.length==6)
            this.shapeFillColor="#"+val;
    }
    this.updateShapeFillOpacity=function(id)
    {
        var val=document.getElementById(id).value;
        if(val!=undefined)
            this.shapeFillOpacity=val;
    }
    this.updateMarqueeColor=function(id)
    {
        var val=document.getElementById(id).value;
        if(val.length==6)
            this.marqueeFillColor=val;
    }
    this.updateMarqueeColor=function(id)
    {
        var val=document.getElementById(id).value;
        if(val!=undefined)
            this.marqueeFillOpacity=val;
    }
}

function load()
{
    iA=new inkAuthoring("inkCanv"); //buildcore buildexperiences in rin.tools.
    paper=iA.paper;
    datastring="";
    currpaths="";
    set_up_icons();
    set_mode(1);

	originalHeight = $("#inkCanv").height();
	originalWidth = $("#inkCanv").width();

	//alert("originals = "+originalHeight+","+originalWidth);

	$("#inkCanv").resizable({
		resize: function(e,ui){
	    	newWidth = ui.size.width;
			newHeight = ui.size.height;
	    	scale_x = newWidth/originalWidth;
			scale_y = newHeight/originalHeight;
	    	resizeObjects(ui.originalPosition,ui.originalSize,ui.position,ui.size,scale_x,scale_y);
	    	originalWidth = newWidth;
			originalHeight = newHeight;
		},
		disabled:true,
	});
	$("inkCanv").css({opacity:1});
};

function load_ink()
{
    iA.loadInk(document.getElementById("ink_to_load").value);
}

function marquee(rectN,rectE,rectS,rectW,rectC)
{
    //constructor for the marquee class
    this.rn=rectN;
    this.re=rectE;
    this.rs=rectS;
    this.rw=rectW;
    this.rc=rectC;
}

function rel_dims(abs_dim,canv_dim)
{
	return parseFloat(abs_dim)/canv_dim;
}

function remove_all()
{
    //removes all Raphael elements from the canvas
    paper.remove();
    paper=Raphael(document.getElementById("inkCanv"),500,500);
    ml=[];
    xy=[];
    paths=[];
    pathObjects=[];
    marquees=[];
    currpaths="";
    update_datastring();
}

function set_mode(i)
{
    i=parseInt(i);
    if((i<1) || (i>4))
    {
        mode=0;
    }
    else
    {
        mode=i;
    }
    var elt=document.getElementById("mode_div");
    switch(mode)
    {
        case 0:
            elt.innerHTML="mode: shapes";
            break;
        case 1:
            elt.innerHTML="mode: pen";
            break;
        case 2:
            elt.innerHTML="mode: eraser";
            break;
        case 3:
            elt.innerHTML="mode: marquee";
            break;
		case 4:
			elt.innerHTML="mode: canvas";
			break;
    }
	if(mode < 4)
	{
	    setDraggable(false);
	}
}

function set_up_icons()
{
    var paper=Raphael(document.getElementById("pen_button"),35,35); paper.path("M13.587,12.074c-0.049-0.074-0.11-0.147-0.188-0.202c-0.333-0.243-0.803-0.169-1.047,0.166c-0.244,0.336-0.167,0.805,0.167,1.048c0.303,0.22,0.708,0.167,0.966-0.091l-7.086,9.768l-2.203,7.997l6.917-4.577L26.865,4.468l-4.716-3.42l-1.52,2.096c-0.087-0.349-0.281-0.676-0.596-0.907c-0.73-0.529-1.751-0.369-2.28,0.363C14.721,6.782,16.402,7.896,13.587,12.074zM10.118,25.148L6.56,27.503l1.133-4.117L10.118,25.148zM14.309,11.861c2.183-3.225,1.975-4.099,3.843-6.962c0.309,0.212,0.664,0.287,1.012,0.269L14.309,11.861z").attr({fill: "#000", stroke: "none"});
   //var paper2=Raphael(document.getElementById("pointer_button"),35,35);
   //paper2.path("M15.834,29.084 15.834,16.166 2.917,16.166 29.083,2.917z").attr({fill: "#000", stroke:"none"});
}

function show_marquees()
{
    var i;
    var len=marquees.length;
    for(i=0;i<len;i++)
    {
        var m=marquees[i];
        m.rn.show();
        m.re.show();
        m.rs.show();
        m.rw.show();
        m.rc.show();
    }
}

function toggle_marquees()
{
    marquees_on=1-marquees_on;
    if(marquees_on)
    {
        show_marquees();
    }
    else
    {
        hide_marquees();
    }
}

function transform_pathstring(currpaths, trans_factor_x, trans_factor_y, rnd)
{
	//the trans_factors will be 1/w, 1/h if we are going from absolute to relative
	//to keep representations short, currently only storing three decimal points
	if(rnd==undefined){ rnd=0; }
	else{ rnd=1; }
	
	var nums=currpaths.match(/[0-9.]+/g);
	var newpath="";
	var j=0, i=0, n=currpaths.length;
	for(i=0;i<n;i++)
	{
		if((currpaths[i]=="M") || (currpaths[i]=="L"))
		{
			if(rnd)
			{
				//alert(newpath);
				newpath=newpath+currpaths[i]+Math.round(parseFloat(nums[j])*trans_factor_x)+",";
				newpath+=Math.round(parseFloat(nums[j+1])*trans_factor_y);
			}
			else
			{
				newpath=newpath+currpaths[i]+(parseFloat(nums[j])*trans_factor_x).toFixed(3)+",";
				newpath+=(parseFloat(nums[j+1])*trans_factor_y).toFixed(3);
			}
			j=j+2;
		}
	}
	return newpath;
}

function update_datastring(canvid)
{
    /*
      Returns a string giving all necessary information to recreate the current scene.
      This is helpful for saving Inks to be loaded later. The x- and y-values are in
	  the interval [0,1], which lets the shapes fit into any sized canvas. The format
	  is as follows:
        -Pen paths are all stored together in the substring
        
            PATH::[pathstring]<Raphael-format path string>[stroke]<stroke color>\
                  [strokeo]<stroke opacity[strokew]strokeWidth[]
                  
         The trailing '[]' makes it easier to parse this string.
        -Rectangles are stored individually in the following format:
            
            RECT::[x]<top corner x>[y]<top corner y>[w]<width>[h]<height>\
	              [fillc]<fill color>[fillo]<fill opacity>[strokec]<stroke color>\
	              [strokeo]<stroke opacity>[strokew]<stroke width>[]
	              
	    -Ellipses are stored individually in the following format:
	    
	        ELLIPSE::[cx]<center x>[cy]<center y>[rx]<x radius>[ry]<y radius>\
	                 [fillc]<fill color>[fillo]<fill opacity>[strokec]<stroke color>\
	                 [strokeo]<stroke opacity>[strokew]<stroke width>[]
	                 
	    -The substrings are separated by "|" characters.
    */
	if(canvid==undefined)
	{
		canvid="inkCanv";
	}
	var canv_height=parseInt($("#"+canvid).css("height"));
	var canv_width=parseInt($("#"+canvid).css("width"));
	
    document.getElementById("test_layers_div").innerHTML="";
    datastring="";
    if(currpaths!="")
    {
	    var nound=currpaths;
		if(currpaths.split("undefined").length>1)
			nound=currpaths.split("undefined")[1]
		var newpath=transform_pathstring(nound,1.0/canv_height,1.0/canv_width);
		//alert("hi");
        var pth="PATH::[pathstring]"+newpath+pathattrs+"[]";
        //document.getElementById("test_layers_div").innerHTML+=pth+"<br />";
        datastring+=pth+"|";
    }
    paper.forEach(function(elt){
		//alert("canv_height = "+canv_height);
	    if(elt.data("type")=="rect")
	    {
	        var pth="RECT::[x]"+rel_dims(elt.attr("x"),canv_width)+"[y]"+rel_dims(elt.attr("y"),canv_height);
			pth+="[w]"+rel_dims(elt.attr("width"),canv_width)+"[h]"+rel_dims(elt.attr("height"),canv_height);
	        pth+="[fillc]"+elt.attr("fill")+"[fillo]"+elt.attr("fill-opacity");
	        pth+="[strokec]"+elt.attr("stroke")+"[strokeo]"+elt.attr("stroke-opacity")+"[strokew]"+elt.attr("stroke-width")+"[]";
	        //document.getElementById("test_layers_div").innerHTML+=pth+"<br />";
	        datastring+=pth+"|";
	    }
	    else if(elt.data("type")=="ellipse")
	    {
	        var pth="ELLIPSE::[cx]"+rel_dims(elt.attr("cx"),canv_width)+"[cy]"+rel_dims(elt.attr("cy"),canv_height);
			pth+="[rx]"+rel_dims(elt.attr("rx"),canv_width)+"[ry]"+rel_dims(elt.attr("ry"),canv_height);
	        pth+="[fillc]"+elt.attr("fill")+"[fillo]"+elt.attr("fill-opacity");
	        pth+="[strokec]"+elt.attr("stroke")+"[strokeo]"+elt.attr("stroke-opacity")+"[strokew]"+elt.attr("stroke-width")+"[]";
	        //document.getElementById("test_layers_div").innerHTML+=pth+"<br />";
	        datastring+=pth+"|";
	    }
	    else if(elt.data("type")=="marquee")
	    {
	        var pth="MARQUEE::[x]"+rel_dims(elt.attr("x"),canv_width)+"[y]"+rel_dims(elt.attr("y"),canv_height);
			pth+="[w]"+rel_dims(elt.attr("width"),canv_width)+"[h]"+rel_dims(elt.attr("height"),canv_height);
	        pth+="[surrfillc]"+elt.data("surr-fill")+"[surrfillo]"+elt.data("surr-opac")+"[]";
	        //document.getElementById("test_layers_div").innerHTML+=pth+"<br />";
	        datastring+=pth+"|";
	    }
	});
	document.getElementById("test_layers_div").innerHTML+=datastring;
	return datastring;
}

function update_ml_xy(str, canvasId)
{
    /*
      When we load a pen path, we need to add its information to the ml and
      xy arrays.
    */
    
	if(canvasId==undefined)
	{
		canvasId="inkCanv";
	}
    var i,j;
    var cw=parseInt($("#"+canvasId).css("width"));
    var ch=parseInt($("#"+canvasId).css("height"));
    //add info to ml
    for(i=0;i<str.length;i++)
    {
        if((str[i]=="L") || (str[i]=="M"))
        {
            ml.push(str[i]);
        }
    }
    
    //add info to xy
    var arr1=str.split("L");
    for(i=0;i<arr1.length;i++)
    {
        if(arr1[i].length>0)
        {
            var arr2=arr1[i].split("M");
            for(j=0;j<arr2.length;j++)
            {
                if(arr2[j].length>0)
                {
                    var arr3=arr2[j].split(",");
                    xy.push([arr3[0],arr3[1]]);
                }
            }
        }
    }
    click=false;
}

/////////

function manipCanvas()
{
	setDraggable(true);
}

function setDraggable(option)
{
	if(option === true)
	{
		set_mode(4);
    	$("#inkCanv").draggable({disabled: false});
    	$("#inkCanv").resizable({disabled: false});
	}
	else
	{
    	//console.log("set not draggable");
    	$("#inkCanv").draggable({disabled: true});
    	$("#inkCanv").resizable({disabled: true});
    	//CSS bug, sets undraggable opacity to 0.35
    	$("#inkCanv").css({opacity: 1});
	}
}

function resizeObjects(orig_pos,orig_size,pos,size,scale_x,scale_y)
{
	//alert("hi");
	paper.forEach(function(elt){
		//alert("canv_height = "+canv_height);
	    if(elt.data("type")!="path")
	    {
			elt.attr({
				x:elt.attr("x")*scale_x,
				y:elt.attr("y")*scale_y,
				cx:elt.attr("cx")*scale_x,
				cy:elt.attr("cy")*scale_y,
				rx:elt.attr("rx")*scale_x,
				ry:elt.attr("ry")*scale_y,
				width:elt.attr("width")*scale_x,
				height:elt.attr("height")*scale_y,
			});
			
			if(elt.data("type")=="ellipse")
			{
				elt.data("currx",elt.attr("cx")-elt.attr("rx"));
				elt.data("curry",elt.attr("cy")-elt.attr("ry"));
				elt.data("curr_rx",elt.attr("rx"));
				elt.data("curr_ry",elt.attr("ry"));
			}
			else
			{
				elt.data("currx",elt.attr("x"));
				elt.data("curry",elt.attr("y"));
			}
		    var gl=elt.glow({"width":15,"color":"#33ff00","opacity":0.8});
			gl.remove();
		
		
		
		
			// document.getElementById("test_layers_div").innerHTML="scale = ("+scale_x+","+scale_y+")";
			// 			var old_x=elt.data("currx");
			// 			var old_y=elt.data("curry");
			// 			var new_x=old_x*scale_x;
			// 			var new_y=old_y*scale_y;
			// 			document.getElementById("test_layers_div").innerHTML+="<br />oldattrx = "+elt.attr("x")+", oldattry"+elt.attr("y");
			// 			document.getElementById("test_layers_div").innerHTML+="<br />oldbbox.wh = "+elt.getBBox().width+","+elt.getBBox().height;
			// 			//elt.scale(scale_x,scale_y,0,0);
			// 			document.getElementById("test_layers_div").innerHTML+="<br />newattrx = "+elt.attr("x")+", newattry"+elt.attr("y");
			// 			document.getElementById("test_layers_div").innerHTML+="<br />newbbox.wh = "+elt.getBBox().width+","+elt.getBBox().height;
			// 			document.getElementById("test_layers_div").innerHTML+="<br />elt.data(currx) = "+elt.data("currx");
			// 			elt.data("currx",new_x);
			// 			elt.data("curry",new_y);
			// 			if(elt.data("type")=="ellipse")
			// 			{
			// 				var new_rx=elt.data("curr_rx")*scale_x;
			// 				var new_ry=elt.data("curr_ry")*scale_y;
			// 				elt.data("curr_rx",new_rx);
			// 			    elt.data("curr_ry",new_ry);
			// 			}
			// 			var bbox=elt.getBBox();
			// 			elt.attr({
			// 				x:new_x,
			// 				y:new_y,
			// 				cx:bbox.x+bbox.width*0.5+(new_x-old_x)*0.5,
			// 	            cy:bbox.y+bbox.height*0.5+(new_y-old_y)*0.5,
			// 	            rx:bbox.width/2.0+(new_x-old_x)*0.5,
			// 	            ry:bbox.height/2.0+(new_y-old_y)*0.5,
			// 	            width:bbox.width+new_x-old_x,
			// 	            height:bbox.height+new_y-old_y
			// 			});
			
	    }
	});
	for(var i = 0; i < pathObjects.length; i++){
	    pathObjects[i].scale(scale_x,scale_y,0,0);
	}
	for(var i = 0; i < xy.length; i++){
	    xy[i][0] = xy[i][0] * scale_x;
	    xy[i][1] = xy[i][1] * scale_y;
	}
}