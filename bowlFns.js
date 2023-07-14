

function Point(x,y,z){

   this.x = x;
   this.y = y;
   this.z = z;
}
function Plane(origin, xDir){
    this.origin = origin;
    this.xDir = xDir;

}

 
function bowl(numTiers,nRakerPlanes,bowlParameters)
{
    this.totalTiers = numTiers;
    this.tiers = [];
    for (var i = 0; i < numTiers; i++)
    {
        this.tiers[i] = new tier(nRakerPlanes,i,bowlParameters[i][3]);//number of sections radially should be defined by structBaySize and pithc dims then maybe redefined to allow more on upper tiers
    }
}
function tier(numRakers,tierNum,nRows)
{
    this.totalSections = numRakers*2;
    this.sections = [];
    for (var i = 0; i < this.totalSections; i++)
    {
        this.sections[i] = new tierSection(nRows);//we need to use a nRows parameter that relates to the specific tier eg. bowlParam[tierNum][numRows]
    }
}
function tierSection(numRows)
{
this.totalPoints = numRows*2;
this.surfPoints = [];        
this.eyePoints = [];
this.focalPoint = new THREE.Vector3(0,0,0);
this.mappingAngle=0;
//also ghost points for super riser situations
var eyeCount = 0;
    for (var i = 0; i < this.totalPoints; i++)
    {
        this.surfPoints[i] = new Point(0,0,0);
        if (i % 2 == 0)
        {
            this.eyePoints[eyeCount] = new Point(0,0,0);
            eyeCount++;
        }
    }
}
function setOffsetVertices(p1, p2, p3,d1,thickness)
{
    var vert = new THREE.Vector3(0, 0, 1);
    var newPoints = [];
    var inPlane = d1.normalize();
    newPoints[0] = pointTranslate(p3, vert.multiplyScalar(-thickness));
    newPoints[1] = pointTranslate(newPoints[0], inPlane.multiplyScalar(thickness));
    newPoints[2] = pointTranslate(p2, vectorAdd(inPlane, vert));
    newPoints[3] = pointTranslate(p1, vert);
    return newPoints;
}
function pointTranslate(p1, transVector)
{
    newPoint = new Point(p1.x + transVector.x, p1.y + transVector.y, p1.z + transVector.z);
    return newPoint;
}
function vectorAdd(v1, v2)
{
    newPoint = new Point(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
    return newPoint;
}
function baseSection(numTiers,bowlParameters,eyeHeight,eyeOffset,boardHeight,superNib,superEyeHoriz,superEyeVert,boundDist)
{
    var theSection = [];
    var lastX = 0, lastZ = 0;
    var startX, startZ, rowWidth, C;
    var numRows;
    var superRiser,superStart;
    for (var i = 0; i < numTiers; i++)
    {

        
        startZ = bowlParameters[i][1];
        C = bowlParameters[i][2];
        numRows = bowlParameters[i][3];
        rowWidth = bowlParameters[i][4];
        superRiser = bowlParameters[i][5];
        superStart = bowlParameters[i][6];
        if(i==0)
        {
        startX = boundDist+rowWidth-eyeOffset;
        }
            else
            {
                startX = bowlParameters[i][0];
            }
        

        theSection[i] = new tierSection(numRows);//startX,startZ,C,nRows,rowWidth,boardHeight)
        theSection[i].eyePoints = setEyePoints(startX + lastX, startZ + lastZ, C,numRows, rowWidth, boardHeight,superRiser,superStart,superNib,eyeOffset,superEyeHoriz);
        theSection[i].surfPoints = sectionSurfPoints(theSection[i].eyePoints, rowWidth, eyeHeight, eyeOffset,superRiser,superStart,superNib,superEyeHoriz,superEyeVert);
        
        lastX = theSection[i].surfPoints[theSection[i].surfPoints.length - 1].x;
        lastZ = theSection[i].surfPoints[theSection[i].surfPoints.length - 1].z;
    }
    //section.xMin =section.theSection[0].surfPoints[0].x-1;
    //section.yMin = section.theSection[0].surfPoints[0].z-1;

    var lastPoint = theSection[numTiers - 1].totalPoints - 1;

    //section.xMax = section.theSection[section.numTiers - 1].surfPoints[lastPoint].x+1;
    //section.yMax = section.theSection[section.numTiers - 1].surfPoints[lastPoint].z+1;
    return theSection;
}
function setSectionPlaneLocations(bowlType,playWidth,playLength,sideBound,sideRadius,endBound,endRadius,cornerR,nCornerBays,structBayW,radius)

        {
            switch (bowlType)
            {
                case 'radial':
                    var sectionPlane = radialPlaneSetUp(playWidth,playLength,sideBound,sideRadius,endBound,endRadius,cornerR,nCornerBays,structBayW);
                    break;
                case 'ortho':
                    var sectionPlane = orthoPlaneSetUp(playLength,endBound,playWidth,sideBound,cornerR,structBayW,playWidth,nCornerBays);
                    break;
                case 'no corners':
                    var sectionPlane = noCornerPlaneSetUp(playLength,endBound,structBayW,playWidth,sideBound);
                    break;
                case 'circular':
                    var sectionPlane = circularPlaneSetUp(radius,structBayW);
                    break;
            }
            return sectionPlane;                  
        }
function setVomitoryPlaneLocations(sectionPlane)
        {
            var deltaX, deltaY,x,y;
            var vomitoryPlane = [];
            var nextUnitXdir = new Point(0,0,0);
            var unitXdir = new THREE.Vector3(0, 0, 0);
            //need the conditionals for partial bowl and no corners here.
            for (var i = 0; i < sectionPlane.length; i++)
            {
                
                unitXdir = sectionPlane[i].xDir.normalize();
                if (i == sectionPlane.length - 1)
                {
                    nextUnitXdir = sectionPlane[0].xDir.normalize();
                    deltaX = sectionPlane[0].origin.x - sectionPlane[i].origin.x;
                    deltaY = sectionPlane[0].origin.y - sectionPlane[i].origin.y;

                    x = (nextUnitXdir.x + unitXdir.x) / 2;
                    y = (nextUnitXdir.y + unitXdir.y) / 2;
                }
                else
                {
                    nextUnitXdir = sectionPlane[i+1].xDir.normalize();
                    deltaX = sectionPlane[i + 1].origin.x - sectionPlane[i].origin.x;
                    deltaY = sectionPlane[i + 1].origin.y - sectionPlane[i].origin.y;

                    x = (nextUnitXdir.x + unitXdir.x) / 2;
                    y = (nextUnitXdir.y + unitXdir.y) / 2;
                }
                var origin = new Point(sectionPlane[i].origin.x + deltaX / 2,sectionPlane[i].origin.y + deltaY / 2,0);
                vomitoryPlane[i] = new Plane(origin,new THREE.Vector3(x, y, 0));
            }
            return vomitoryPlane;
        }
        function radialPlaneSetUp(playWidth,playLength,sideBound,sideRadius,endBound,endRadius,cornerR,nCornerBays,structBayW)
        {
            var sectionPlane = [];
            var count=0;
            var sidecentreX = playWidth/2+sideBound - sideRadius;
            var sidecentreY = 0;
            var endcentreX = 0;
            var endcentreY = playLength/2+endBound - endRadius;
            var intersect = intersectCircles(sidecentreX,sidecentreY,sideRadius - cornerR,endcentreX,endcentreY,endRadius - cornerR);
            var centreX = intersect[0];
            var centreY = intersect[1];

            var sweepAngleSide = 2 * Math.atan(centreY / (centreX - sidecentreX));
            var sweepSideBay = 2*Math.asin(structBayW/2/sideRadius);

            var nSideBays = ~~(Math.floor(sweepAngleSide/sweepSideBay));

            var sweepAngleEnd= 2*Math.atan(centreX/(centreY-endcentreY));
            var sweepEndBay = 2*Math.asin(structBayW/2/endRadius);
            var nEndBays=~~(Math.floor(sweepAngleEnd/sweepEndBay));


            var endArc = new THREE.Vector3(centreX, centreY - endcentreY,0);
            var sideArc = new THREE.Vector3(centreX - sidecentreX, centreY, 0);

            var cornerSweep = sideArc.angleTo(endArc);//*Math.PI/180;
            var cornA = cornerSweep / (nCornerBays + 1);
            var trueR = cornerR / Math.cos(cornA / 2);
            var theta=1, startAngle=1, radius=1;
            var numBays=1;
            var halfbayStart =false;
            
            for (var i = 0; i < 8; i++)
            {
               switch(i)
               {
                case 0://side right
                       centreX = sidecentreX;  
                       centreY=0;  
                       theta = sweepSideBay;
                       numBays = nSideBays;
                       startAngle =  (numBays*theta)/-2; 
                       radius = sideRadius; 
                       halfbayStart = false;
                break;
                case 1://top right corner
                centreX = intersect[0];
                centreY = intersect[1];  
                       theta = cornA;
                       startAngle = sweepAngleSide / 2; 
                       radius = cornerR; 
                       numBays = nCornerBays;
                       halfbayStart = true;
                break;
                case 2://north end
                centreX = 0;
                centreY = endcentreY;
                theta = sweepEndBay;
                       numBays = nEndBays;
                       startAngle = Math.PI / 2 - numBays * theta / 2; 
                       radius = endRadius; 
                       halfbayStart = false;
                break;
                case 3://north west corner
                centreX = -intersect[0];
                centreY = intersect[1];  
                       theta = cornA; 
                       startAngle = Math.PI/2 + sweepAngleEnd/2; 
                       radius = cornerR; 
                       numBays = nCornerBays;
                       halfbayStart = true;
                break;
                case 4://west side
                centreX = -sidecentreX;  
                       centreY=0;  
                       theta = sweepSideBay;
                       numBays = nSideBays;
                       startAngle = Math.PI - (numBays * theta) / 2; 
                       radius = sideRadius; 
                       halfbayStart = false;
                break;
                case 5://south west conrer
                centreX = -intersect[0];
                centreY = -intersect[1];  
                       theta = cornA; 
                       startAngle = Math.PI + sweepAngleSide/2; 
                       radius = cornerR; 
                       numBays = nCornerBays;
                       halfbayStart = true;
                break;
                case 6:// south end
                centreX = 0;
                centreY = -endcentreY;
                theta = sweepEndBay;
                       numBays = nEndBays;
                       startAngle = 1.5*Math.PI  - numBays * theta / 2; 
                       radius = endRadius; 
                       halfbayStart = false;
                break;
                case 7://south east corner
                 centreX = intersect[0];
                centreY = -intersect[1];  
                       theta = cornA; 
                       startAngle = 1.5*Math.PI + sweepAngleEnd/2; 
                       radius = cornerR; 
                       numBays = nCornerBays;
                       halfbayStart = true;
                break;
                }
            var partPlanes = arcSweepBay(centreX, centreY, theta, startAngle, radius, numBays, halfbayStart);
               for (var p=0;p<partPlanes.length;p++ )
               {
                sectionPlane[count]=partPlanes[p];
                count++;
               }
            }
            return sectionPlane;
                
        }
        function intersectCircles(c1x, c1y, c1rad, c2x, c2y, c2rad)// see http://local.wasp.uwa.edu.au/~pbourke/geometry/2circle/
        {
            var intersect = [];
            var d, a, x, y,h,prop;
            

            //distance between centres
            d = Math.sqrt((c2x - c1x) * (c2x - c1x) + (c2y - c1y) * (c2y - c1y));
            if (d > c1rad + c2rad)
            {
            }// no intersection circles apart
            if (d < c1rad - c2rad)
            {
            }// no intersection cicrle inside circle
            if (c1rad == c2rad)
            {
            }// infinite intersections circles over lap

            else
            {
                a = (c1rad * c1rad - c2rad * c2rad + d * d) / (2 * d);
                h = Math.sqrt(c1rad * c1rad - (a * a));
                prop = a / d;


                x = c1x+(prop) * (c2x - c1x);

                y = c1y+prop * (c2y - c1y);

                intersect[0] = x + h * (c2y - c1y) / d;
                intersect[1] = y - h * (c2x - c1x) / d;

                intersect[0] = x - h * (c2y - c1y) / d;//always gives two intersects generally we want this for the bowl layout.
                intersect[1] = y + h * (c2x - c1x) / d;
            }


             return intersect;
        }
        function worstCaseSection(sectionPlane,pitchWidth,pitchLength)
        {
            var shortestDist=[];
            shortestDist[0]=1000000000;
            var index;
            var upVect = new THREE.Vector3(0,0,1);
            var origin = new THREE.Vector3();
            var xcoords = [pitchWidth/2,-pitchWidth/2,-pitchWidth/2,pitchWidth/2];
            var ycoords = [pitchLength/2,pitchLength/2,-pitchLength/2,-pitchLength/2];
            var norm = new THREE.Vector3();
            
            var start = new THREE.Vector3();
            var end = new THREE.Vector3();
            var allFocalPoints = [];
            for(var i =0;i<sectionPlane.length;i++)
            {
            origin = new THREE.Vector3(sectionPlane[i].origin.x,sectionPlane[i].origin.y,sectionPlane[i].origin.z);
            var intersect = [];
            norm.crossVectors(upVect,sectionPlane[i].xDir);
            var plane = new THREE.Plane();
            plane.setFromNormalAndCoplanarPoint(norm,origin );
            
                    for(var j=0;j<4;j++)
                    {
                        
                        start = new THREE.Vector3(xcoords[j], ycoords[j],0);
                        if(j==3)
                        {
                        
                        end = new THREE.Vector3(xcoords[0], ycoords[0], 0 );
                        }
                        else
                        {
                        
                        end = new THREE.Vector3(xcoords[j+1], ycoords[j+1], 0 );
                        }
                        var line = new THREE.Line3( start,end );
                        var intersection = new THREE.Vector3();
                        intersection = plane.intersectLine(line);
                        //test it is on the segment
                        if(intersection)
                        {

                            if(start.distanceTo(intersection)<start.distanceTo(end)||end.distanceTo(intersection)<start.distanceTo(end))
                            {
                            intersect.push(intersection);
                            }
                        }
                    }
                    if(intersect.length>0)//keep the closest
                    {
                        var distance=100000000; 
                        for(var d =0;d<intersect.length;d++)
                        {
                        if(origin.distanceTo(intersect[d])<distance)
                        {
                            distance = origin.distanceTo(intersect[d]);
                            allFocalPoints[i]=intersect[d];
                           
                        }
                        }
                    }
                    if(distance<shortestDist[0])
                    {
                        shortestDist[0]=distance;
                        shortestDist[1]=i;
                        shortestDist[2]=allFocalPoints[i];

                    }
            }

            return shortestDist;
        }
        function arcSweepBay( centreX,  centreY,  theta,  startAngle,  radius, numBays, halfbayStart)
        {
            var sectionPlane = [];
            var xO,yO,xP,yP;
                for (var d = 0; d <= numBays; d++)
                        {
                            
                            //                                            
                            if (halfbayStart)//half bay on first for corners
                            {
                                if (d == 0)//half bay on first
                                {
                                    xO = centreX + radius * Math.cos(startAngle + theta / 2);
                                    yO= centreY + radius * Math.sin(startAngle + theta / 2);
                                    xP = radius * Math.cos(startAngle + theta / 2);
                                    yP = radius * Math.sin(startAngle + theta / 2);
                                    
                                }
                                else
                                {
                                    xO = centreX + radius * Math.cos(startAngle + (theta * d + theta / 2));
                                    yO = centreY + radius * Math.sin(startAngle + (theta * d + theta / 2));
                                    xP = radius * Math.cos(startAngle + (theta * d + theta / 2));
                                    yP = radius * Math.sin(startAngle + (theta * d + theta / 2));
                                    
                                }
                            }
                            else
                            {
                                xO = centreX + radius * Math.cos(startAngle + (theta * d));
                                yO = centreY + radius * Math.sin(startAngle + (theta * d));
                                xP = radius * Math.cos(startAngle + (theta * d));
                                yP = radius * Math.sin(startAngle + (theta * d));
                                
                            }
                            var tempPlane = new Plane(new Point(xO,yO,0),new THREE.Vector3(xP,yP,0));
                            sectionPlane[d]=tempPlane;
                        }
                        return sectionPlane;
        }
function orthoPlaneSetUp(playLength,endBound,playWidth,sideBound,cornerR,structBayW,playWidth,nCornerBays)
        {
            var nSideBays = Math.floor(((playLength+endBound) / 2 - cornerR) / structBayW) * 2;
            var nEndBays = Math.floor(((playWidth+sideBound) / 2 - cornerR) / structBayW) * 2;
            var sectionPlane =[];
            var cornA = Math.PI / 2 / (nCornerBays + 1);
            var trueR = cornerR / Math.cos(cornA / 2);
            var xMin;
            var yMin;
            var oX,oY,dX,dY;
            var count=0;
            for (var i = 0; i < 8; i++)
            {
                if (i == 0 || i == 4)//side bay
                {

                    for (var d = 0; d <= nSideBays; d++)
                    {
                        if (i == 0)//right side
                        {
                            yMin = (nSideBays * structBayW) / -2;
                            //origin xyz 
                            oX = ((playWidth+sideBound) / 2);
                            oY = yMin + (structBayW * d);
                            dX = 1;
                            dY = 0;
                        }
                        else//left side
                        {
                            yMin = (nSideBays * structBayW) / 2;
                            //origin xyz 
                            oX = -((playWidth+sideBound) / 2);
                            oY = yMin - (structBayW * d);
                            dX = -1;
                            dY = 0;
                        }
                        sectionPlane[count] = new Plane(new Point(oX,oY,0),new THREE.Vector3(dX,dY,0));
                        count++;
                    }
                }
                else
                {
                    if (i == 2 || i == 6)//end bay
                    {
                        xMin = (nEndBays * structBayW) / 2;
                        //                                    
                        for (var d = 0; d <= nEndBays; d++)
                        {
                            if (i == 2)// northEnd
                            {
                                //origin xyz 
                                oX = xMin - (structBayW * d);
                                oY = ((playLength+endBound)/ 2);
                                dX = 0;
                                dY = 1;
                            }
                            else
                            {
                                //origin xyz 
                                oX = -xMin + (structBayW * d);
                                oY = -((playLength+endBound)/ 2);

                                dX = 0;
                                dY = -1;
                            }
                            sectionPlane[count] = new Plane(new Point(oX,oY,0),new THREE.Vector3(dX,dY,0));
                            count++;
                        }
                    }
                    else//corners
                    {
                        //local centres cs at fillets
                        var centreX = (playWidth+sideBound) / 2 - cornerR;
                        var centreY = (playLength+endBound) / 2 - cornerR;
                        var startAngle = 0;
                        if (i == 1) //NE++
                        {

                        }
                        if (i == 3) //NW-+
                        {
                            centreX = -centreX;
                            startAngle = Math.PI / 2;
                        }
                        if (i == 5) //SW--
                        {
                            centreY = -centreY;
                            centreX = -centreX;
                            startAngle = Math.PI;
                        }
                        if (i == 7) //SE+-
                        {
                            centreY = -1 * centreY;
                            startAngle = Math.PI * 1.5;
                        }

                        //                                    
                        for (var d = 0; d <= nCornerBays; d++)
                        {                                         
                            if (d == 0)//half bay on first
                            {
                                oX = centreX + trueR * Math.cos(startAngle + cornA / 2);
                                oY = centreY + trueR * Math.sin(startAngle + cornA / 2);
                                dX = trueR * Math.cos(startAngle + cornA / 2);
                                dY = trueR * Math.sin(startAngle + cornA / 2);
                            }
                            else
                            {
                                oX = centreX + trueR * Math.cos(startAngle + (cornA * d + cornA / 2));
                                oY = centreY + trueR * Math.sin(startAngle + (cornA * d + cornA / 2));
                                dX = trueR * Math.cos(startAngle + (cornA * d + cornA / 2));
                                dY = trueR * Math.sin(startAngle + (cornA * d + cornA / 2));
                            }
                            sectionPlane[count] = new Plane(new Point(oX,oY,0),new THREE.Vector3(dX,dY,0));
                            count++;
                        }
                    }
                }
            }
            return sectionPlane;
        } 
function noCornerPlaneSetUp(playLength,endBound,structBayW,playWidth,sideBound)
        {
            var nSideBays = Math.floor(((playLength+endBound) / 2) / structBayW) * 2;
            var nEndBays = Math.floor(((playWidth+sideBound) / 2) / structBayW) * 2;
            var sectionPlane=[];
            var actualBayW; 
            var xMin;
            var yMin;
            var oX,oY,dX,dY;
            var count=0;
            for (var i = 0; i < 4; i++)
            {
                
                if (i %2==0)//side bay
                {
                   actualBayW =(playLength+endBound)/nSideBays;
                    for (var d = 0; d <= nSideBays; d++)
                    {
                        if (i == 0)//right side
                        {
                            yMin = (nSideBays * actualBayW) / -2;
                            //origin xyz 
                            oX = ((playWidth+sideBound) / 2);
                            oY = yMin + (actualBayW * d);
                            dX = 1;
                            dY = 0;
                        }
                        else//left side
                        {
                            yMin = (nSideBays * actualBayW) / 2;
                            //origin xyz 
                            oX = -((playWidth+sideBound) / 2);
                            oY = yMin - (actualBayW * d);
                            dX = -1;
                            dY = 0;
                        }
                        sectionPlane[count] = new Plane(new Point(oX,oY,0),new THREE.Vector3(dX,dY,0));
                        count++;
                    }
                }

                else
                {
                    actualBayW = (playWidth+sideBound) / nEndBays;
                    xMin = (nEndBays * actualBayW) / 2;
                    //                                    
                    for (var d = 0; d <= nEndBays; d++)
                    {
                        if (i == 1)// northEnd
                        {
                            //origin xyz 
                            oX = xMin - (actualBayW * d);
                            oY = ((playLength+endBound) / 2);

                            dX = 0;
                            dY = 1;0;
                        }
                        else
                        {
                            //origin xyz 
                            oX = -xMin + (actualBayW * d);
                            oY = -((playLength+endBound) / 2);
                            dX = 0;
                            dY = -1;
                        }
                        sectionPlane[count] = new Plane(new Point(oX,oY,0),new THREE.Vector3(dX,dY,0));
                        count++;
                    }

                }
                
            }
            return sectionPlane;
        }
function circularPlaneSetUp(radius,structBayW)
    {
    var numBays = Math.floor(Math.PI*radius*2/structBayW);
    var theta = 2*Math.PI/numBays;
    var halfbayStart = false;
    var sectionPlanes = arcSweepBay(0, 0, theta, 0, radius, numBays, halfbayStart);
    return sectionPlanes;
    }  

function mapBaseSectionToClosestPlane(baseSection,vomplanes, smallBound)
{
    var baseVector = new THREE.Vector3(1, 0,0);

    var index = smallBound[1];
    var sectionVector = new THREE.Vector3(vomplanes[index].xDir.x, vomplanes[index].xDir.y,0);
    
    var transformAngle = Math.atan2(vomplanes[index].xDir.y, vomplanes[index].xDir.x);
   sectionVector.normalize();
    sectionVector.multiplyScalar(-smallBound[0]);
    var theMappedSection = [];
    for (var i = 0; i < baseSection.length; i++)//ste through tiers of base section
    {
theMappedSection[i] = new tierSection(baseSection[i].totalPoints/2);
theMappedSection[i].focalPoint = smallBound[2];
theMappedSection[i].mappingAngle = transformAngle;
        for(var p=0;p<baseSection[i].surfPoints.length;p++)
        {

            x = baseSection[i].surfPoints[p].x * Math.cos(transformAngle) + vomplanes[index].origin.x+sectionVector.x;//using tier count as theSection includes all tiers and in each tier of theBowl sections are radial
            y = baseSection[i].surfPoints[p].x * Math.sin(transformAngle) + vomplanes[index].origin.y+sectionVector.y;//need to transform
            z = baseSection[i].surfPoints[p].z;
            theMappedSection[i].surfPoints[p]= new Point(x,y,z);
           
        }
        pointCount = 0;
        for(var p=0;p<baseSection[i].eyePoints.length;p++)
        {

            x = baseSection[i].eyePoints[p].x * Math.cos(transformAngle) + vomplanes[index].origin.x+sectionVector.x;//should include a transform based on section.theBowl.tiers[tierCount].sections[sectionCount].plane 
            y = baseSection[i].eyePoints[p].x * Math.sin(transformAngle) + vomplanes[index].origin.y+sectionVector.y;//need to transform
            z = baseSection[i].eyePoints[p].z;
            theMappedSection[i].eyePoints[p]= new Point(x,y,z);
            
        }
    }
    return theMappedSection;
}     
function transformBaseSectionToBowl(theBowl,sectionPlane,theSection,bowlType,smallBound)
        {
            var tierCount = 0, sectionCount, pointCount;
            //var endArc = new THREE.Vector3(centreX, centreY - endcentreY,0);
            var baseVector = new THREE.Vector3(1, 0,0);
            var sectionVector,nextSectionVector;
            var transformAngle,scaleAngle;
            var scaling;
            
            for (var t=0;t< theBowl.totalTiers;t++)
            {

                sectionCount = 0;
                
                for(var ts=0;ts< theBowl.tiers[tierCount].totalSections;ts++)
                {

                    pointCount = 0;
                   
                    sectionVector = new THREE.Vector3(sectionPlane[sectionCount].xDir.x, sectionPlane[sectionCount].xDir.y,0);
                    sectionVector.normalize();
                    sectionVector.multiplyScalar(smallBound[0]);
                    if (theBowl.tiers[tierCount].totalSections == sectionCount+1)
                    {
                        nextSectionVector = new THREE.Vector3(sectionPlane[0].xDir.x, sectionPlane[0].xDir.y,0);
                    }
                    else
                    {
                        nextSectionVector = new THREE.Vector3(sectionPlane[sectionCount + 1].xDir.x, sectionPlane[sectionCount + 1].xDir.y,0);
                    }
                    scaleAngle = sectionVector.angleTo(nextSectionVector);// * Math.PI / 180;
                    transformAngle = Math.atan2(sectionVector.y,sectionVector.x);//*Math.PI/180;
                    

                    if (transformAngle % Math.PI == 0||bowlType=='no corners'||sectionCount%2!=0)//no scaling if orthogonal section or if no corner bowl or at vomitories
                    {
                        scaling = 1;
                    }
                    else
                    {
                        scaling = 1 / Math.cos(scaleAngle);
                    }
                    
                    for(var p=0;p<theBowl.tiers[tierCount].sections[sectionCount].surfPoints.length;p++)
                    {

                        x = theSection[tierCount].surfPoints[pointCount].x * scaling * Math.cos(transformAngle) + sectionPlane[sectionCount].origin.x-sectionVector.x;//using tier count as theSection includes all tiers and in each tier of theBowl sections are radial
                        y = theSection[tierCount].surfPoints[pointCount].x * scaling * Math.sin(transformAngle) + sectionPlane[sectionCount].origin.y-sectionVector.y;//need to transform
                        z = theSection[tierCount].surfPoints[pointCount].z;
                        theBowl.tiers[tierCount].sections[sectionCount].surfPoints[pointCount]= new Point(x,y,z);

                        pointCount++;
                    }
                    pointCount = 0;
                    for(var p=0;p<theBowl.tiers[tierCount].sections[sectionCount].eyePoints.length;p++)
                    {

                        x = theSection[tierCount].eyePoints[pointCount].x * scaling * Math.cos(transformAngle) + sectionPlane[sectionCount].origin.x-sectionVector.x;//should include a transform based on section.theBowl.tiers[tierCount].sections[sectionCount].plane 
                        y = theSection[tierCount].eyePoints[pointCount].x * scaling * Math.sin(transformAngle) + sectionPlane[sectionCount].origin.y-sectionVector.y;//need to transform
                        z = theSection[tierCount].eyePoints[pointCount].z;
                        theBowl.tiers[tierCount].sections[sectionCount].eyePoints[pointCount]= new Point(x,y,z);
                        pointCount++;
                    }
                    sectionCount++;
                }
                tierCount++;
            }
        }
function getSeatCount(theBowl,bowlType,noCornersectionRefs,seatWidth)//also logic for generation of dxf
{
    var riserCount = 0;
    var tierCount = 0, sectionCount;
    var start, end;
    var totalSeats = 0;
    var p1,p2;
    for (var t=0;t< theBowl.totalTiers;t++)
    {
        sectionCount = 0;
        
        for (var j = 0; j < theBowl.tiers[tierCount].sections[0].totalPoints - 1; j += 2)
        {
            var dist = 0;
            
            for(var ts=0;ts< theBowl.tiers[tierCount].totalSections;ts++)
            {
                if (bowlType == 'no corners' && ts == noCornersectionRefs[0] ||
                    bowlType == 'no corners' && ts == noCornersectionRefs[1] ||
                    bowlType == 'no corners' && ts == noCornersectionRefs[2] ||
                    bowlType == 'no corners' && ts == noCornersectionRefs[3])
                {// no geometry in corner gaps
                }
                else
                {
                    p1 = new THREE.Vector3(theBowl.tiers[tierCount].sections[ts].surfPoints[j].x, theBowl.tiers[tierCount].sections[ts].surfPoints[j].y, theBowl.tiers[tierCount].sections[ts].surfPoints[j].z);
                    if (ts == theBowl.tiers[tierCount].totalSections - 1)
                    {
                        p2 = new THREE.Vector3(theBowl.tiers[tierCount].sections[0].surfPoints[j].x, theBowl.tiers[tierCount].sections[0].surfPoints[j].y, theBowl.tiers[tierCount].sections[0].surfPoints[j].z);
                    }
                    else
                    {
                        p2 = new THREE.Vector3(theBowl.tiers[tierCount].sections[ts + 1].surfPoints[j].x, theBowl.tiers[tierCount].sections[ts + 1].surfPoints[j].y, theBowl.tiers[tierCount].sections[ts + 1].surfPoints[j].z);
                    }
                    dist += p1.distanceTo(p2);
                }
                sectionCount++;
            }//end section loop
            riserCount++;
            totalSeats += Math.floor(dist / seatWidth);
        }//end points loop
        tierCount++;
    }
    //document.getElementById('output').innerHTML = 'Based on seat width of '+seatWidth+'m estimated gross capacity is:'+ totalSeats+' seats.';
}
function combinePlanes(raker,vomitory)
{
    var combined = [];
    var count=0;
    for(var i=0;i<raker.length;i++){
    combined[count]=raker[i];count++;
    combined[count]=vomitory[i];count++;
    }
    return combined;
}
function setEyePoints(startX,startZ,C,nRows,rowWidth,boardHeight,superRiser,superStart,superNib,eyeOffset,superEyeHoriz) 
{
var positions = [];//an array for xyz
var deltaSHoriz = 0.5;//differences between standing and seated eye posiitons
var deltaSVert = 0.4;
var prevX,prevZ;
				for ( var i = 0; i < nRows; i ++ ) 
				{

						var x = 0;
						var y = 0;
						var z = 0;	
                    if(superRiser&&i==superStart)
                    {	
                    //shift the previous positions to give standing eye position and add in the super riser specific horiznotal	
                    prevX = positions[i-1].x - (deltaSHoriz);	
                    prevZ = positions[i-1].z +(deltaSVert);		
    	                x = prevX + eyeOffset+superNib+superEyeHoriz;
                        z = prevZ + C + rowWidth * ((prevZ-boardHeight + C) / prevX);
                    }
                    else
                    {
                        if(superRiser&&i==superStart+1)//row after the super riser
                        {
                        //x shifts to include 3 rows for super platform back nib wall nib and row less horiz position
                        //also a wider row is required
                        x = positions[i-1].x + (4*rowWidth-superEyeHoriz)+superNib*2+rowWidth*1.6-eyeOffset;
                        //z is with standar c over the wheel chair posiiton but could be over the handrail
                        z = positions[i-1].z + C + rowWidth * ((positions[i-1].z-boardHeight + C) / positions[i-1].x);
                        }
                        else
                        {
                           if (i == 0)
                            {
                            x = startX;
                            
                            z = startZ;
                            }
                            else
                            {
                                x = positions[i-1].x + rowWidth;
                                z = positions[i-1].z + C + rowWidth * ((positions[i-1].z + C) / positions[i-1].x);
                                
                            } 
                        }
                        
                    }
                    var p = new Point(x,y,z);
						positions[ i ] = p;
				}
				return positions;
			}

function sectionSurfPoints(eyeCoords, rowWidth, eyeHeight, eyeOffset,superRiser,superStart,superNib,superEyeHoriz,superEyeVert)
    {
        var surfPoints = [];
           var x=0;var y=0;var z=0;
            var pointCount=0;
            var p;
            for (var i = 0; i < eyeCoords.length; i++)
            {
                if(superRiser&&i==superStart)
                {
                    //4 surface points are needed beneath the wheel chair eye point
                    //p1 x is same as previous
                    z = eyeCoords[i-1].z - eyeHeight+0.1 ;//z is previous eye - eyeH + something
                        p = new Point(x,y,z);
                        surfPoints[pointCount] = p;
                        pointCount++;
                    //p2 z is the same a sprevious
                    x = x + superNib;
                        p = new Point(x,y,z);
                        surfPoints[pointCount] = p;
                        pointCount++;
                    //p3 x is unchanged
                    z = eyeCoords[i].z - superEyeVert;
                        p = new Point(x,y,z);
                        surfPoints[pointCount] = p;
                        pointCount++;
                    //p4 z unchnaged
                    x = x +3*rowWidth;
                        p = new Point(x,y,z);
                        surfPoints[pointCount] = p;
                        pointCount++;
                }
                else
                {
                    if(superRiser&&i==superStart+1)//row after the super riser
                    {               
                    //4 surface points are needed beneath the wheel chair eye point
                    //p1 x is same as previous
                    z = eyeCoords[i].z - eyeHeight + 1.1;//1.1 is handrail height
                        p = new Point(x,y,z);
                        surfPoints[pointCount] = p;
                        pointCount++;
                    //p2 z unchanged
                    x = x+superNib;
                        p = new Point(x,y,z);
                        surfPoints[pointCount] = p;
                        pointCount++;
                    //p3 x unchanged
                    z = eyeCoords[i].z - eyeHeight;
                        p = new Point(x,y,z);
                        surfPoints[pointCount] = p;
                        pointCount++;
                    //p4 z unchanged
                    x = eyeCoords[i].x + eyeOffset;
                        p = new Point(x,y,z);
                        surfPoints[pointCount] = p;
                        pointCount++;
                    }
                    else
                    {//standard two points per eye
                        for (var j=0;j<2;j++)
                        {
                    
                            if (j == 0)
                            {
                                z = eyeCoords[i].z - eyeHeight;
                                x = eyeCoords[i].x - rowWidth + eyeOffset;
                                
                            }
                            else
                            {
                                x = eyeCoords[i].x + eyeOffset;
                            }
                        p = new Point(x,y,z);
                        surfPoints[pointCount] = p;
                        pointCount++;
                        }
                    }
                }   
                
            }
            return surfPoints;
    }
    function setpoints(startX,startZ,C,segments,boardHeight,rowWidth) 
{
  var geometry = new THREE.BufferGeometry();
        
  var eyePos = setEyePoints(startX,startZ,C,segments,rowWidth,boardHeight);

  var surfPoints = sectionSurfPoints(eyePos, rowWidth, 1.1, 0.15);
  var positions = new Float32Array( segments * 3 );
  var pcount=0;
    for (var i =0;i< surfPoints.length; i++) 
    {

      positions[pcount]=  surfPoints[i].x;
      pcount++;
      positions[pcount]=  surfPoints[i].y;
      pcount++;
      positions[pcount]=  surfPoints[i].z;
      pcount++;
    };
        
        
    geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
        

        //geometry.computeBoundingSphere();
  var material = new THREE.LineBasicMaterial({color: 0x0000ff});

  line = new THREE.Line( geometry, material );
  scene.add( line );    
}
function meshDrawVomitory(theBowl,bowlType,noCornersectionRefs,bowlParams){
    mesh=[];
    var v1,v2,v3,v4,v5,v6,r,vInfront,vBehind;
    var meshN=0;
    var meshMat = new THREE.MeshLambertMaterial({color: 0xC0C0C0});
    var deltaX,deltaY;
    var backShiftVector,frontShiftVector;
    var shiftD=0.5;
    var zeroShift = new THREE.Vector3(0,0,0);
    var move;
    var vomitory,vomitoryStart;
    for (var t=0;t< theBowl.totalTiers;t++){
        if(bowlParams[t][5]){
            vomitory =true;
        vomitoryStart=bowlParams[t][6]*2-1;
        }
        else{
        vomitory =bowlParams[t][7];
        vomitoryStart=bowlParams[t][8]*2-1;
        }
        var lastIndex = theBowl.tiers[t].sections[0].totalPoints-1;
         // first add mesh vertices        
        for(var ts=0;ts< theBowl.tiers[t].totalSections;ts+=2){//counting through rakers
            var skipfront =false;
            var skipback =false;
                for(var nc=0;nc<noCornersectionRefs.length;nc++)
                {
                    if(ts==noCornersectionRefs[nc]&&bowlType=='no corners')
                    {
                        if(nc%2==0)
                        {
                            skipback =true;
                        }
                        else
                        {
                            skipfront=true;
                        }
                        
                    }
                }
                
                        r = ts;
                        vInfront=ts+1;//vomitory in front
                        if(ts==0)
                        {vBehind=theBowl.tiers[t].totalSections-1;}
                        else{vBehind=ts-1}//vomitory behind
                        var geom = new THREE.Geometry();
                        var count=0;
                    //meshN =0;
                        //first vBehind moving points from the raker to the vomitorys
                        deltaX = theBowl.tiers[t].sections[vBehind].surfPoints[0].x-theBowl.tiers[t].sections[r].surfPoints[0].x;
                        deltaY = theBowl.tiers[t].sections[vBehind].surfPoints[0].y-theBowl.tiers[t].sections[r].surfPoints[0].y;
                        backShiftVector = new THREE.Vector3(deltaX,0,deltaY);
                        backShiftVector.normalize();
                        backShiftVector.multiplyScalar(shiftD);
                        backShiftVector.negate();

                        deltaX = theBowl.tiers[t].sections[vInfront].surfPoints[0].x-theBowl.tiers[t].sections[r].surfPoints[0].x;
                        deltaY = theBowl.tiers[t].sections[vInfront].surfPoints[0].y-theBowl.tiers[t].sections[r].surfPoints[0].y;
                        frontShiftVector = new THREE.Vector3(deltaX,0,deltaY);
                        frontShiftVector.normalize();
                        frontShiftVector.multiplyScalar(shiftD);
                        frontShiftVector.negate();


                        for (var j =0;j< lastIndex-1; j++) 
                        {
                            for (var p =0;p< 2; p++) 
                        
                            {
                                var sp = j+p;
                            //vomitory and vomitory start should come from bParams
                                if(vomitory&&j>vomitoryStart&&j<vomitoryStart+8){move=backShiftVector;}
                                else{move=zeroShift;}

                                if(j==vomitoryStart+1||j==vomitoryStart+8){//extra vertex for vomitory
                                    v1 = new THREE.Vector3(theBowl.tiers[t].sections[vBehind].surfPoints[sp].x+move.x,theBowl.tiers[t].sections[vBehind].surfPoints[sp].y+move.z,theBowl.tiers[t].sections[vBehind].surfPoints[sp].z);
                                    geom.vertices.push(v1);
                                    
                                }
                                else{
                                    v1 = new THREE.Vector3(theBowl.tiers[t].sections[vBehind].surfPoints[sp].x+move.x,theBowl.tiers[t].sections[vBehind].surfPoints[sp].y+move.z,theBowl.tiers[t].sections[vBehind].surfPoints[sp].z);
                                    geom.vertices.push(v1);
                                }
                                
                            //then raker
                                v1 = new THREE.Vector3(theBowl.tiers[t].sections[r].surfPoints[sp].x,theBowl.tiers[t].sections[r].surfPoints[sp].y,theBowl.tiers[t].sections[r].surfPoints[sp].z);
                                geom.vertices.push(v1);
                            //then vInfront

                                if(vomitory&&j>vomitoryStart&&j<vomitoryStart+8){move=frontShiftVector;}
                                else{move=zeroShift;}

                                if(j==vomitoryStart+1||j==vomitoryStart+8){//extra vertex for vomitory
                                    v1 = new THREE.Vector3(theBowl.tiers[t].sections[vInfront].surfPoints[sp].x+move.x,theBowl.tiers[t].sections[vInfront].surfPoints[sp].y+move.z,theBowl.tiers[t].sections[vInfront].surfPoints[sp].z);
                                    geom.vertices.push(v1);
                                }
                                else{
                                    v1 = new THREE.Vector3(theBowl.tiers[t].sections[vInfront].surfPoints[sp].x+move.x,theBowl.tiers[t].sections[vInfront].surfPoints[sp].y+move.z,theBowl.tiers[t].sections[vInfront].surfPoints[sp].z);
                                geom.vertices.push(v1);
                                }
                                
                            }
                            //then faces we have 6 new vertices each time we need 4 faces
                            v1=count*6;
                            if(skipback)
                            {
                                geom.faces.push( new THREE.Face3( v1+4, v1+2, v1+1 ) );
                                geom.faces.push( new THREE.Face3( v1+2, v1+4, v1+5 ) );
                            }
                            else
                            {
                                if(skipfront)
                                {
                                    geom.faces.push( new THREE.Face3( v1+3, v1+1, v1) );
                                geom.faces.push( new THREE.Face3( v1+1, v1+3, v1+4 ) );
                                }
                                else
                                {
                                    geom.faces.push( new THREE.Face3( v1+4, v1+2, v1+1 ) );
                                geom.faces.push( new THREE.Face3( v1+2, v1+4, v1+5 ) );
                                geom.faces.push( new THREE.Face3( v1+3, v1+1, v1) );
                                geom.faces.push( new THREE.Face3( v1+1, v1+3, v1+4 ) );
                                }
                            }
                                
                                
                                count++;
                            
                        }           
                    geom.computeFaceNormals();
                    mesh[meshN]= new THREE.Mesh( geom,meshMat );
                    mesh[meshN].rotation.x=-Math.PI/2;
                    scene.add(mesh[meshN]);
                    meshN++;
                    
                    
            
        }   
                
    }
}
function meshDraw(theBowl,bowlType,noCornersectionRefs){
    
    var v1,v2,v3;
    mesh=[];
    var meshMat = new THREE.MeshLambertMaterial({color: 0xC0C0C0});
    for (var t=0;t< theBowl.totalTiers;t++){
        var geom = new THREE.Geometry();
        var lastIndex = theBowl.tiers[t].sections[0].totalPoints-1;
         // first add mesh vertices        
        for(var ts=0;ts< theBowl.tiers[t].totalSections;ts++){
            
            
                for (var j =0;j<= lastIndex; j++) 
                {
                    v1 = new THREE.Vector3(theBowl.tiers[t].sections[ts].surfPoints[j].x,theBowl.tiers[t].sections[ts].surfPoints[j].z,theBowl.tiers[t].sections[ts].surfPoints[j].y);
                    geom.vertices.push(v1);
                }
        }
          // then mesh faces        
        for(var ts=0;ts< theBowl.tiers[t].totalSections;ts++){

            if (bowlType == 'no corners' && ts == noCornersectionRefs[0] ||
                bowlType == 'no corners' && ts == noCornersectionRefs[1] ||
                bowlType == 'no corners' && ts == noCornersectionRefs[2] ||
                bowlType == 'no corners' && ts == noCornersectionRefs[3])
                    {// no geometry in corner gaps
                    }
                    else
                    {
                        if(ts==theBowl.tiers[t].totalSections-1){
                            for (var j =0;j< lastIndex-2; j++) {
                            v1 = j + (ts *(lastIndex+1));
                            v2 = j + 1 +  (ts *(lastIndex+1));
                            v3 = j;
                            geom.faces.push( new THREE.Face3( v3, v2, v1 ) );

                            v1 = j + 1;
                            v2 = j ;
                            v3 = j + 1 +  (ts *(lastIndex+1));
                            geom.faces.push( new THREE.Face3( v3, v2, v1 ) );
                            }
                        }
                        else{
                            for (var j =0;j< lastIndex-2; j++) {
                            v1 = j + (ts *(lastIndex+1));
                            v2 = j + 1 +  (ts *(lastIndex+1));
                            v3 = j + ((ts+1) *(lastIndex+1));
                            geom.faces.push( new THREE.Face3( v3, v2, v1 ) );

                            v1 = j + 1+((ts+1) *(lastIndex+1));
                            v2 = j + ((ts+1) *(lastIndex+1));
                            v3 = j + 1 +  (ts *(lastIndex+1));
                            geom.faces.push( new THREE.Face3( v3, v2, v1 ) );
                            }
                        }
                    }
            
        }
        
        geom.computeFaceNormals();
        mesh[t]= new THREE.Mesh( geom,meshMat );
        scene.add(mesh[t]);
    }
}
function drawAllSections(theBowl){
    for(var i=0;i<line.length;i++){
        if (line[i]){
                    scene.remove( line[i] );
                    // renderer.deallocateObject( graphMesh );
                }
    }
    var lineCount=0;
    for (var t=0;t< theBowl.totalTiers;t++)
            {
                
                for(var ts=0;ts< theBowl.tiers[t].totalSections;ts++)
                {
                    

                    var segments = theBowl.tiers[t].sections[ts].totalPoints;
                    var geometry = new THREE.BufferGeometry();
                    var positions = new Float32Array( segments * 3 );
                    var pcount=0;
                    for (var j =0;j< segments; j++) 
                    {

                        positions[pcount]=  theBowl.tiers[t].sections[ts].surfPoints[j].x;
                        pcount++;
                        positions[pcount]=  theBowl.tiers[t].sections[ts].surfPoints[j].y;
                        pcount++;
                        positions[pcount]=  theBowl.tiers[t].sections[ts].surfPoints[j].z;
                        pcount++;
                    };      
                    geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
                    //geometry.computeBoundingSphere();
                    var material = new THREE.LineBasicMaterial({color: 0x0000ff});

                    line[lineCount] = new THREE.Line( geometry, material );
                    scene.add( line[lineCount] );   
                    lineCount++;
                }
            }

}