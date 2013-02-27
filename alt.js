window.onload = load;
var paper;
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

//if the pointer icon is clicked, switch to default mode (0)
//if the pen icon is clicked, switch to pen mode (1)
//if the eraser icon is clicked, switch to eraser mode (2)

function add_attributes(elt)
{
    //var strokewidth=document.getElementById("strokewidth");
    //var strokecolor=document.getElementById("strokecolor");
    //var fillcolor=document.getElementById("fillcolor");
    //var fillopacity=document.getElementById("fillopacity");
    //$("#canvas").mousedown();
    var canv=document.getElementById("canv");
    var gl;
    var resize=0; //if 1, we are in zoom mode rather than pan mode
    var noglow=0; //if 1, glowing is disabled
    var origmousex;
    var origmousey;
    var strokeWidth=document.getElementById("shape_stroke_width").value;
    var strokeColor=document.getElementById("shape_stroke_color").value;
    var strokeOpacity=document.getElementById("shape_stroke_opacity").value;
    var fillColor=document.getElementById("shape_fill_color").value;
    var fillOpacity=document.getElementById("shape_fill_opacity").value;
    elt.mouseover(function(){
        if(!noglow && (mode==0))
        {
            gl=elt.glow({"width":15,"color":"#33ff00","opacity":.8});
        }
    })
    elt.mouseout(function(){
        gl.remove();
    })
    elt.attr({
        "stroke-width":strokeWidth,
        "stroke":"#"+strokeColor,
        "stroke-opacity":strokeOpacity,
        "fill":"#"+fillColor,
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
	        var canvx=parseInt($("#canv").css("left"));
	        var canvbx=parseInt($("#canv").css("border-left"));
	        var canvy=parseInt($("#canv").css("top"));
	        var canvby=parseInt($("#canv").css("border-top"));
	        
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
	        noglow=0;
	        resize=0;
	        this.animate({opacity:1},500,"<>");
        }
    });   
}

function add_marq_attributes(marq)
{
    var elt=marq.rc;
    var canv=document.getElementById("canv");
    var gl;
    var resize=0; //if 1, we are in zoom mode rather than pan mode
    var noglow=0; //if 1, glowing is disabled
    var origmousex;
    var origmousey;
    var w=parseInt($('#canv').css("width"));
    var h=parseInt($('#canv').css("height"));
    var marqFillColor=document.getElementById("marq_color").value;
    var marqFillOpacity=document.getElementById("marq_opacity").value;
    
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
    elt.data("surr-fill","#"+marqFillColor);
    elt.data("surr-opac",marqFillOpacity);
    var mset=paper.set();
    mset.push(marq.rn,marq.re,marq.rs,marq.rw);
    mset.attr({
        "stroke-width":0,
        "stroke":"#222222",
        "fill":"#"+marqFillColor,
        "fill-opacity":marqFillOpacity
    });
    
    
    //drag(move, start, stop,...)
    elt.drag(function(dx,dy,mousex,mousey){
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
		        this.attr({
		            width:bbox.width+mousex-origmousex,
		            height:bbox.height+mousey-origmousey
		        });
		        marq.rs.attr({
		            y:bbox.y+bbox.height+mousey-origmousey,
		            height:h-(bbox.y+bbox.height+mousey-origmousey)
		        });
		        marq.re.attr({
		            x:bbox.x+bbox.width+mousex-origmousex,
		            width:w-(bbox.x+bbox.width+mousex-origmousex),
		            height:bbox.height+mousey-origmousey
		        })
		        marq.rw.attr({
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
	        var canvx=parseInt($("#canv").css("left"));
	        var canvbx=parseInt($("#canv").css("border-left"));
	        var canvy=parseInt($("#canv").css("top"));
	        var canvby=parseInt($("#canv").css("border-top"));
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

function add_rectangle()
{
    set_mode(0);
    var x=Math.floor(Math.random()*300);
    var y=Math.floor(Math.random()*300);
    rect=paper.rect(x,y,50,50);
    rect.data("currx",x);
    rect.data("curry",y);
    rect.data("type","rect");
    add_attributes(rect);
}

function add_ellipse()
{
    set_mode(0);
    var x=Math.floor(Math.random()*300);
    var y=Math.floor(Math.random()*300);
    var rx=20+Math.floor(Math.random()*40);
    var ry=20+Math.floor(Math.random()*40);
    ellipse=paper.ellipse(x,y,rx,ry);
    ellipse.data("currx",ellipse.getBBox().x);
    ellipse.data("curry",ellipse.getBBox().y);
    ellipse.data("curr_rx",rx);
    ellipse.data("curr_ry",ry);
    ellipse.data("type","ellipse");
    add_attributes(ellipse);
}

function add_marquee()
{
    set_mode(3);
    var topx=200+Math.floor(Math.random()*10), botx=300+Math.floor(Math.random()*10), topy=200+Math.floor(Math.random()*10), boty=300+Math.floor(Math.random()*10);
    //var topx=40, botx=80, topy=40, boty=80;
    var w=parseInt($('#canv').css("width"));
    var h=parseInt($('#canv').css("height"));
    var rn=paper.rect(0,0,w,topy);
    rn.data("currx",0);
    rn.data("curry",0);
    var re=paper.rect(botx,topy,w-botx,boty-topy);
    re.data("currx",botx);
    re.data("curry",topy);
    var rs=paper.rect(0,boty,w,h-boty);
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
    add_marq_attributes(m);
    marquees.push(m);
    show_marquees();
    marquees_on=1;
    // var elt=document.getElementById("test_layers_div");
    //             elt.innerHTML=marquees;
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

function drawPaths()
{
    var strokeColor=document.getElementById("pen_color").value;
    var strokeOpacity=document.getElementById("pen_opacity").value;
    var strokeWidth=document.getElementById("pen_width").value;
    var paths;
    //removes all objects in pathObjects to be redrawn
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
        "stroke":"#"+strokeColor,
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

function load()
{
    paper=Raphael(document.getElementById("canv"),500,500);
    set_up_icons();
    set_mode(1);
    $("#canv").mousedown(function(e)
    {
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
            $("#canv").css('cursor','crosshair');
        }
        else
        {
            $("#canv").css('cursor','pointer');
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
            $("#canv").css('cursor', "pointer");
        }
 });
};

function marquee(rectN,rectE,rectS,rectW,rectC)
{
    //constructor for the marquee class
    this.rn=rectN;
    this.re=rectE;
    this.rs=rectS;
    this.rw=rectW;
    this.rc=rectC;
}

function remove_all()
{
    //removes all Raphael elements from the canvas
    paper.remove();
    paper=Raphael(document.getElementById("canv"),500,500);
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
    if((i<1) || (i>3))
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
    }
}

function set_up_icons()
{
   var paper=Raphael(document.getElementById("pen_button"),35,35); paper.path("M13.587,12.074c-0.049-0.074-0.11-0.147-0.188-0.202c-0.333-0.243-0.803-0.169-1.047,0.166c-0.244,0.336-0.167,0.805,0.167,1.048c0.303,0.22,0.708,0.167,0.966-0.091l-7.086,9.768l-2.203,7.997l6.917-4.577L26.865,4.468l-4.716-3.42l-1.52,2.096c-0.087-0.349-0.281-0.676-0.596-0.907c-0.73-0.529-1.751-0.369-2.28,0.363C14.721,6.782,16.402,7.896,13.587,12.074zM10.118,25.148L6.56,27.503l1.133-4.117L10.118,25.148zM14.309,11.861c2.183-3.225,1.975-4.099,3.843-6.962c0.309,0.212,0.664,0.287,1.012,0.269L14.309,11.861z").attr({fill: "#000", stroke: "none"});
   //var paper2=Raphael(document.getElementById("pointer_button"),35,35);
   //paper2.path("M15.834,29.084 15.834,16.166 2.917,16.166 29.083,2.917z").attr({fill: "#000", stroke:"none"});
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

function update_datastring()
{
    document.getElementById("test_layers_div").innerHTML="";
    datastring="";
    if(currpaths!="")
    {
        var pth="PATH::[pathstring]"+currpaths.split("undefined")[1]+pathattrs;
        //document.getElementById("test_layers_div").innerHTML+=pth+"<br />";
        datastring+=pth;
    }
    paper.forEach(function(elt){
	    if(elt.data("type")=="rect")
	    {
	        var pth="RECT::[x]"+elt.attr("x")+"[y]"+elt.attr("y")+"[w]"+elt.attr("width")+"[h]"+elt.attr("height");
	        pth+="[fillc]"+elt.attr("fill")+"[fillo]"+elt.attr("fill-opacity");
	        pth+="[strokec]"+elt.attr("stroke")+"[strokeo]"+elt.attr("stroke-opacity")+"[strokew]"+elt.attr("stroke-width");
	        //document.getElementById("test_layers_div").innerHTML+=pth+"<br />";
	        datastring+=pth;
	    }
	    else if(elt.data("type")=="ellipse")
	    {
	        var pth="ELLIPSE::[cx]"+elt.attr("cx")+"[cy]"+elt.attr("cy")+"[rx]"+elt.attr("rx")+"[ry]"+elt.attr("ry");
	        pth+="[fillc]"+elt.attr("fill")+"[fillo]"+elt.attr("fill-opacity");
	        pth+="[strokec]"+elt.attr("stroke")+"[strokeo]"+elt.attr("stroke-opacity")+"[strokew]"+elt.attr("stroke-width");
	        //document.getElementById("test_layers_div").innerHTML+=pth+"<br />";
	        datastring+=pth;
	    }
	    else if(elt.data("type")=="marquee")
	    {
	        var pth="MARQUEE::[x]"+elt.attr("x")+"[y]"+elt.attr("y")+"[w]"+elt.attr("width")+"[h]"+elt.attr("height");
	        pth+="[surrfillc]"+elt.data("surr-fill")+"[surrfillo]"+elt.data("surr-opac");
	        //document.getElementById("test_layers_div").innerHTML+=pth+"<br />";
	        datastring+=pth;
	    }
	});
	document.getElementById("test_layers_div").innerHTML+="<br /><br />DATASTRING:<br />"+datastring;
	return datastring;
}