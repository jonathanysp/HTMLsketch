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

//if the pointer icon is clicked, switch to default mode (0)
//if the pen icon is clicked, switch to pen mode (1)
//if the eraser icon is clicked, switch to eraser mode (2)

function add_attributes(elt,fillColor,fillOpacity,strokeColor,strokeOpacity,strokeWidth)
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
    if(fillColor==undefined)
        fillColor="#"+document.getElementById("shape_fill_color").value;
    if(fillOpacity==undefined)
        fillOpacity=document.getElementById("shape_fill_opacity").value;
    if(strokeColor==undefined)
        strokeColor="#"+document.getElementById("shape_stroke_color").value;
    if(strokeOpacity==undefined)
        strokeOpacity=document.getElementById("shape_stroke_opacity").value;
    if(strokeWidth==undefined)
        strokeWidth=document.getElementById("shape_stroke_width").value;
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

function add_marq_attributes(marq,marqFillColor,marqFillOpacity)
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
        strokeColor="#"+document.getElementById("pen_color").value;
    if(strokeOpacity==undefined)
        strokeOpacity=document.getElementById("pen_opacity").value;
    if(strokeWidth==undefined)
        strokeWidth=document.getElementById("pen_width").value;
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
        parsetype="i";
        
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
    this.paper=Raphael(document.getElementById(canvasId),cw,ch);
    this.loadInk=function(datastr){
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
                    var x=get_attr(shape,"x");
                    var y=get_attr(shape,"y");
                    var w=get_attr(shape,"w");
                    var h=get_attr(shape,"h");
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
                    var cx=get_attr(shape,"cx");
                    var cy=get_attr(shape,"cy");
                    var rx=get_attr(shape,"rx");
                    var ry=get_attr(shape,"ry");
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
                    var canvw=parseInt($('#canv').css("width"));
                    var canvh=parseInt($('#canv').css("height"));
                    var topx=get_attr(shape,"x");
                    var topy=get_attr(shape,"y");
                    var w=get_attr(shape,"w");
                    var h=get_attr(shape,"h");
                    var surrfillc=get_attr(shape,"surrfillc","s");
                    var surrfillo=get_attr(shape,"surrfillo","f");
                    //alert("surrfillc = "+surrfillc+", surrfillo = "+surrfillo);
                    var botx=topx+w;
                    var boty=topy+h;
                    var rn=paper.rect(0,0,canvw,topy);
                    rn.data("currx",0);
                    rn.data("curry",0);
                    var re=paper.rect(botx,topy,canvw-botx,boty-topy);
                    re.data("currx",botx);
                    re.data("curry",topy);
                    var rs=paper.rect(0,boty,canvw,canvh-boty);
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
                    //[pathstring]M284,193L284,193[stroke]000000[strokeo]1[strokew]10[]
                    var pathstring=get_attr(shape,"pathstring","s");
                    var strokec=get_attr(shape,"stroke","s");
                    var strokeo=get_attr(shape,"strokeo","f");
                    var strokew=get_attr(shape,"strokew");
                    currpaths=pathstring;
                    update_ml_xy(pathstring);
                    drawPaths(pathstring,strokec,strokeo,strokew);
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
    

}

function load()
{
    iA=new inkAuthoring("canv");
    //paper=Raphael(document.getElementById("canv"),500,500);
    paper=iA.paper;
    datastring="";
    currpaths="";
    //var teststr="PATH::[pathstring]M276,234L276,234L276,237L271,248M256,273L251,279L247,283L245,285L243,286L241,288L239,290L237,293M236,297M236,300L236,303L237,307L242,309L247,311L255,314L262,314L270,314L277,314L283,314L289,314L295,314L301,312M312,307M320,305M335,307M342,313L343,316L345,320L346,324L347,326L348,330M350,337M446,79L446,79L446,82L446,90L446,98L448,102L449,109L450,113L451,117L452,123M421,245L402,256M332,288L318,296M329,331L340,346M336,431L324,434M257,429L229,421L203,413L190,406L176,393M137,173L137,173L137,172L137,168L142,162L160,138L179,120L194,109M235,101L246,105L260,112L271,119L277,123L281,127L283,129L284,129M322,170L322,170L319,172L304,172L274,172L238,167M188,153L174,148L166,146L161,145L160,144L159,144L158,147L157,152L153,161L150,167L149,172L147,175L144,180L144,184L142,188L141,193L141,195L141,196M141,199L141,199M347,80L347,80M371,118L371,118L369,123L372,137L376,155L378,165L380,175L381,180L381,183L382,184L382,185[stroke]#000000[strokeo]1[strokew]10[]|RECT::[x]137[y]259[w]50[h]50[fillc]#ffff00[fillo]0.5[strokec]#000000[strokeo]1[strokew]3[]|ELLIPSE::[cx]95[cy]3[rx]43[ry]35[fillc]#ffff00[fillo]0.5[strokec]#000000[strokeo]1[strokew]3[]|MARQUEE::[x]205[y]208[w]103[h]98[surrfillc]#222222[surrfillo]0.8[]|RECT::[x]352[y]192[w]50[h]50[fillc]#ffff00[fillo].5[strokec]#000000[strokeo]1[strokew]3[]|ELLIPSE::[cx]273[cy]198[rx]75.96404506583949[ry]94.5[fillc]#ffff00[fillo].5[strokec]#000000[strokeo]1[strokew]3[]|MARQUEE::[x]183[y]106[w]260[h]183[surrfillc]#222222[surrfillo].8[]|";
    //iA.loadInk(teststr);
    set_up_icons();
    set_mode(1);
    /*$("#canv").mousedown(function(e)
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
 });*/
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

function update_datastring()
{
    /*
      Returns a string giving all necessary information to recreate the current scene.
      This is helpful for saving Inks to be loaded later. The format is as follows:
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
    document.getElementById("test_layers_div").innerHTML="";
    datastring="";
    if(currpaths!="")
    {
        var pth="PATH::[pathstring]"+currpaths.split("undefined")[1]+pathattrs+"[]";
        //document.getElementById("test_layers_div").innerHTML+=pth+"<br />";
        datastring+=pth+"|";
    }
    paper.forEach(function(elt){
	    if(elt.data("type")=="rect")
	    {
	        var pth="RECT::[x]"+elt.attr("x")+"[y]"+elt.attr("y")+"[w]"+elt.attr("width")+"[h]"+elt.attr("height");
	        pth+="[fillc]"+elt.attr("fill")+"[fillo]"+elt.attr("fill-opacity");
	        pth+="[strokec]"+elt.attr("stroke")+"[strokeo]"+elt.attr("stroke-opacity")+"[strokew]"+elt.attr("stroke-width")+"[]";
	        //document.getElementById("test_layers_div").innerHTML+=pth+"<br />";
	        datastring+=pth+"|";
	    }
	    else if(elt.data("type")=="ellipse")
	    {
	        var pth="ELLIPSE::[cx]"+elt.attr("cx")+"[cy]"+elt.attr("cy")+"[rx]"+elt.attr("rx")+"[ry]"+elt.attr("ry");
	        pth+="[fillc]"+elt.attr("fill")+"[fillo]"+elt.attr("fill-opacity");
	        pth+="[strokec]"+elt.attr("stroke")+"[strokeo]"+elt.attr("stroke-opacity")+"[strokew]"+elt.attr("stroke-width")+"[]";
	        //document.getElementById("test_layers_div").innerHTML+=pth+"<br />";
	        datastring+=pth+"|";
	    }
	    else if(elt.data("type")=="marquee")
	    {
	        var pth="MARQUEE::[x]"+elt.attr("x")+"[y]"+elt.attr("y")+"[w]"+elt.attr("width")+"[h]"+elt.attr("height");
	        pth+="[surrfillc]"+elt.data("surr-fill")+"[surrfillo]"+elt.data("surr-opac")+"[]";
	        //document.getElementById("test_layers_div").innerHTML+=pth+"<br />";
	        datastring+=pth+"|";
	    }
	});
	document.getElementById("test_layers_div").innerHTML+="DATASTRING:<br />"+datastring;
	return datastring;
}

function update_ml_xy(str)
{
    /*
      When we load a pen path, we need to add its information to the ml and
      xy arrays.
    */
    
    var i,j;
    
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