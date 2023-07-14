function writeIFC(theBowl,bowlType,noCornersectionRefs,bowlParams,sectionPlane)
{

     var riserThickness = 0.15;
    var objCount = 1021;
    var fileName = "bowl.ifc";
    var ifcOutput;
    var  guid;
    //string ifc_guid = IfcGuid.ToIfcGuid(a);
    var ifcOutput = ifcSetUp(fileName);
    ifcOutput = ifcData(ifcOutput );
    ifcOutput = ifcSurface(ifcOutput);

    var riserCount = 0;
    var tierCount = 0, sectionCount;
    var start = 0;
    var end = theBowl.tiers[tierCount].totalSections;


    for (var t=0;t< theBowl.totalTiers;t++)
    {
        sectionCount = 0;
        for (var i = start; i < end; i++)//
        {
            if (bowlType == 'no corners' && ts == noCornersectionRefs[0] ||
                bowlType == 'no corners' && ts == noCornersectionRefs[1] ||
                bowlType == 'no corners' && ts == noCornersectionRefs[2] ||
                bowlType == 'no corners' && ts == noCornersectionRefs[3])
                {// no geometry in corner gaps
                }
            else
            {
                for (var j = 0; j <theBowl.tiers[tierCount].sections[i].totalPoints - 2; j+=2)
                {
                    var allFaces = "";

                    var p1 = new Point(theBowl.tiers[tierCount].sections[i].surfPoints[j].x, theBowl.tiers[tierCount].sections[i].surfPoints[j].y, theBowl.tiers[tierCount].sections[i].surfPoints[j].z);
                    var p2 = new Point(theBowl.tiers[tierCount].sections[i].surfPoints[j + 1].x, theBowl.tiers[tierCount].sections[i].surfPoints[j + 1].y, theBowl.tiers[tierCount].sections[i].surfPoints[j + 1].z);
                    var p3 = new Point(theBowl.tiers[tierCount].sections[i].surfPoints[j + 2].x, theBowl.tiers[tierCount].sections[i].surfPoints[j + 2].y, theBowl.tiers[tierCount].sections[i].surfPoints[j + 2].z);
                    var p4;
                    var p5;
                    var p6;
                    var pointsLeft=[];
                    if (i == theBowl.tiers[tierCount].totalSections - 1)//last section
                    {

                        p4 = new Point(theBowl.tiers[tierCount].sections[0].surfPoints[j].x, theBowl.tiers[tierCount].sections[0].surfPoints[j].y, theBowl.tiers[tierCount].sections[0].surfPoints[j].z);
                        p5 = new Point(theBowl.tiers[tierCount].sections[0].surfPoints[j + 1].x, theBowl.tiers[tierCount].sections[0].surfPoints[j + 1].y, theBowl.tiers[tierCount].sections[0].surfPoints[j + 1].z);
                        p6 = new Point(theBowl.tiers[tierCount].sections[0].surfPoints[j + 2].x, theBowl.tiers[tierCount].sections[0].surfPoints[j + 2].y, theBowl.tiers[tierCount].sections[0].surfPoints[j + 2].z);
                        pointsLeft = setOffsetVertices(p4, p5, p6, sectionPlane[0].xDir, riserThickness);
                        
                    }
                    else
                    {

                        p4 = new Point(theBowl.tiers[tierCount].sections[i + 1].surfPoints[j].x, theBowl.tiers[tierCount].sections[i + 1].surfPoints[j].y, theBowl.tiers[tierCount].sections[i + 1].surfPoints[j].z);
                        p5 = new Point(theBowl.tiers[tierCount].sections[i + 1].surfPoints[j + 1].x, theBowl.tiers[tierCount].sections[i + 1].surfPoints[j + 1].y, theBowl.tiers[tierCount].sections[i + 1].surfPoints[j + 1].z);
                        p6 = new Point(theBowl.tiers[tierCount].sections[i + 1].surfPoints[j + 2].x, theBowl.tiers[tierCount].sections[i + 1].surfPoints[j + 2].y, theBowl.tiers[tierCount].sections[i + 1].surfPoints[j + 2].z);
                        pointsLeft = setOffsetVertices(p4, p5, p6, sectionPlane[i + 1].xDir, riserThickness);
                        
                    }
                    var pointsRight = setOffsetVertices(p1, p2, p3, sectionPlane[i].xDir, riserThickness);

                    ifcOutput +=ifcFace(p1, p4, pointsLeft[3], pointsRight[3], objCount);
                    objCount+=7;
                    var firstFace= objCount;
                    ifcOutput +=ifcFace(p1, p4, p5, p2, objCount);
                    objCount+=7;
                    ifcOutput +=ifcFace(p2, p5, pointsLeft[0], pointsRight[0], objCount);
                    objCount+=7;
                    ifcOutput +=ifcFace(pointsRight[0], pointsLeft[0], pointsLeft[1], pointsRight[1], objCount);
                    objCount+=7;
                    ifcOutput +=ifcFace(pointsRight[1], pointsLeft[1], pointsLeft[2], pointsRight[2], objCount);
                    objCount+=7;
                    ifcOutput +=ifcFace(pointsRight[2], pointsLeft[2], pointsLeft[3], pointsRight[3], objCount);
                    objCount+=7;
                    allFaces = incFaceList(firstFace)
                    //ifcOutput =ifcFace(ifcOut, p1, p2, pointsRight[0], pointsRight[1], pointsRight[2], pointsRight[3], ref objCount, ref allFaces);
                    //ifcOutput =ifcFace(ifcOut, p4, p5, pointsLeft[0], pointsLeft[1], pointsLeft[2], pointsLeft[3], ref objCount, ref allFaces);

                    objCount++;
                    ifcOutput +="#" + objCount + "= IFCCONNECTEDFACESET ((" + allFaces + "));\n";
                    objCount++;
                    ifcOutput +="#" + objCount + "= IFCFACEBASEDSURFACEMODEL ((#" + (objCount-1) + "));\n";
                    /* a single shape representation of type 'SurfaceModel' is included ---------------------------- */
                    objCount++;
                    ifcOutput +="#" + objCount + "= IFCSHAPEREPRESENTATION(#202,'Body','SurfaceModel',(#" + (objCount - 1) + "));\n";
                    
                    /* proxy element shape representation ---------------------------------------------------------- */
                    objCount++;
                    ifcOutput +="#" + objCount + "= IFCPRODUCTDEFINITIONSHAPE($,$,(#" + (objCount - 1) +"));\n";
                    
                    /* proxy element with surface model shape representation, assigned to the building ------------- */
                    guid = fakeUID();
                    objCount++;
                    ifcOutput +="#" + objCount + "= IFCBUILDINGELEMENTPROXY('"+guid+"',$,'P-1','sample proxy',$,#1001,#" + (objCount - 1) + ",$,$);\n";
                    /* proxy element assigned to the building ------------------------------------------------------ */
                    
                    guid = fakeUID();
                    objCount++;
                    ifcOutput +="#" + objCount + "=IFCRELCONTAINEDINSPATIALSTRUCTURE('" + guid + "',$,'Physical model',$,(#" + (objCount - 1) + "),#500);\n";
                    riserCount++;
                }
            }

            sectionCount++;

        }

        tierCount++;
    }

    ifcOutput +=ifcFinish(objCount);
    return ifcOutput;
}
function writeIFCFacetBrep(theBowl,bowlType,noCornersectionRefs,bowlParams,sectionPlane)
{

     var riserThickness = 0.15;
    var objCount = 1021;
    var fileName = "bowl.ifc";
    var ifcOutput;
    var  guid;
    //string ifc_guid = IfcGuid.ToIfcGuid(a);
    var ifcOutput = ifcSetUp(fileName);
    ifcOutput = ifcData(ifcOutput );
    ifcOutput = ifcSurface(ifcOutput);

    var riserCount = 0;
    var tierCount = 0, sectionCount;
    var start = 0;
    var end = theBowl.tiers[tierCount].totalSections;
    var slabs="";

    for (var t=0;t< theBowl.totalTiers;t++)
    {
        sectionCount = 0;
        for (var i = start; i < end; i++)//
        {
            if (bowlType == 'no corners' && ts == noCornersectionRefs[0] ||
                bowlType == 'no corners' && ts == noCornersectionRefs[1] ||
                bowlType == 'no corners' && ts == noCornersectionRefs[2] ||
                bowlType == 'no corners' && ts == noCornersectionRefs[3])
                {// no geometry in corner gaps
                }
            else
            {
                for (var j = 0; j <theBowl.tiers[tierCount].sections[i].totalPoints - 2; j+=2)
                {
                    var allFaces = "";

                    var p1 = new Point(theBowl.tiers[tierCount].sections[i].surfPoints[j].x, theBowl.tiers[tierCount].sections[i].surfPoints[j].y, theBowl.tiers[tierCount].sections[i].surfPoints[j].z);
                    var p2 = new Point(theBowl.tiers[tierCount].sections[i].surfPoints[j + 1].x, theBowl.tiers[tierCount].sections[i].surfPoints[j + 1].y, theBowl.tiers[tierCount].sections[i].surfPoints[j + 1].z);
                    var p3 = new Point(theBowl.tiers[tierCount].sections[i].surfPoints[j + 2].x, theBowl.tiers[tierCount].sections[i].surfPoints[j + 2].y, theBowl.tiers[tierCount].sections[i].surfPoints[j + 2].z);
                    var p4;
                    var p5;
                    var p6;
                    var pointsLeft=[];
                    if (i == theBowl.tiers[tierCount].totalSections - 1)//last section
                    {

                        p4 = new Point(theBowl.tiers[tierCount].sections[0].surfPoints[j].x, theBowl.tiers[tierCount].sections[0].surfPoints[j].y, theBowl.tiers[tierCount].sections[0].surfPoints[j].z);
                        p5 = new Point(theBowl.tiers[tierCount].sections[0].surfPoints[j + 1].x, theBowl.tiers[tierCount].sections[0].surfPoints[j + 1].y, theBowl.tiers[tierCount].sections[0].surfPoints[j + 1].z);
                        p6 = new Point(theBowl.tiers[tierCount].sections[0].surfPoints[j + 2].x, theBowl.tiers[tierCount].sections[0].surfPoints[j + 2].y, theBowl.tiers[tierCount].sections[0].surfPoints[j + 2].z);
                        pointsLeft = setOffsetVertices(p4, p5, p6, sectionPlane[0].xDir, riserThickness);
                        
                    }
                    else
                    {

                        p4 = new Point(theBowl.tiers[tierCount].sections[i + 1].surfPoints[j].x, theBowl.tiers[tierCount].sections[i + 1].surfPoints[j].y, theBowl.tiers[tierCount].sections[i + 1].surfPoints[j].z);
                        p5 = new Point(theBowl.tiers[tierCount].sections[i + 1].surfPoints[j + 1].x, theBowl.tiers[tierCount].sections[i + 1].surfPoints[j + 1].y, theBowl.tiers[tierCount].sections[i + 1].surfPoints[j + 1].z);
                        p6 = new Point(theBowl.tiers[tierCount].sections[i + 1].surfPoints[j + 2].x, theBowl.tiers[tierCount].sections[i + 1].surfPoints[j + 2].y, theBowl.tiers[tierCount].sections[i + 1].surfPoints[j + 2].z);
                        pointsLeft = setOffsetVertices(p4, p5, p6, sectionPlane[i + 1].xDir, riserThickness);
                        
                    }
                    var pointsRight = setOffsetVertices(p1, p2, p3, sectionPlane[i].xDir, riserThickness);

                    ifcOutput +=ifcFace(p1, p4, pointsLeft[3], pointsRight[3], objCount);
                    objCount+=7;
                    var firstFace= objCount;
                    ifcOutput +=ifcFaceFromPointSet([p1, p4, p5, p2], objCount);
                    objCount+=7;
                    ifcOutput +=ifcFaceFromPointSet([p2, p5, pointsLeft[0], pointsRight[0]], objCount);
                    objCount+=7;
                    ifcOutput +=ifcFaceFromPointSet([pointsRight[0], pointsLeft[0], pointsLeft[1], pointsRight[1]], objCount);
                    objCount+=7;
                    ifcOutput +=ifcFaceFromPointSet([pointsRight[1], pointsLeft[1], pointsLeft[2], pointsRight[2]], objCount);
                    objCount+=7;
                    ifcOutput +=ifcFaceFromPointSet([pointsRight[2], pointsLeft[2], pointsLeft[3], pointsRight[3]], objCount);
                    objCount+=7;
                    
                    ifcOutput +=ifcFaceFromPointSet([p1, p2, pointsRight[0], pointsRight[1], pointsRight[2], pointsRight[3]],objCount);
                    objCount+=9;
                    ifcOutput +=ifcFaceFromPointSet([p4, p5, pointsLeft[0], pointsLeft[1], pointsLeft[2], pointsLeft[3]], objCount);
                    objCount+=9;
                    allFaces = incFaceList(firstFace)
                    objCount++;
                    ifcOutput +="#" + objCount + "= IFCCLOSEDSHELL ((" + allFaces + "));\n";
                    objCount++;
                    ifcOutput +="#" + objCount + "= IFCFACETEDBREP (#" + (objCount-1) + ");\n";
                    /* a single shape representation of type 'SurfaceModel' is included ---------------------------- */
                    objCount++;
                    ifcOutput +="#" + objCount + "= IFCSHAPEREPRESENTATION(#202,'Body','Brep',(#" + (objCount - 1) + "));\n";
                    
                    /* proxy element shape representation ---------------------------------------------------------- */
                    objCount++;
                    ifcOutput +="#" + objCount + "= IFCPRODUCTDEFINITIONSHAPE($,$,(#" + (objCount - 1) +"));\n";
                    
                    /* proxy element with surface model shape representation, assigned to the building ------------- */
                    guid = fakeUID();
                    objCount++;
                    ifcOutput +="#" + objCount + "= IFCSLAB('"+guid+"',#110,$,$,$,#511,#" + (objCount - 1) + ",$,.FLOOR.);\n";
                    slabs +=  "#" + objCount + ",";                         
                    /* proxy element assigned to the building ------------------------------------------------------ */
                    
                    
                    riserCount++;
                }
            }

            sectionCount++;

        }

        tierCount++;
    }
    guid = fakeUID();
    objCount++;
    ifcOutput +="#" + objCount + "=IFCRELCONTAINEDINSPATIALSTRUCTURE('" + guid + "',#110,'Building','Building Container for Elements',(#" + slabs.slice(1, slabs.length-1) + "),#500);\n";

    ifcOutput +=ifcFinish(objCount);
    return ifcOutput;
}
function timeStamp() {
// Create a date object with the current time 2012-06-18T18:00:00
  var now = new Date();
 
// Create an array with the current month, day and time
  var date = [ now.getFullYear(),now.getMonth() + 1, now.getDate() ];
 
// Create an array with the current hour, minute and second
  var time = [ now.getHours(), now.getMinutes(), now.getSeconds() ];
 
// Determine AM or PM suffix based on the hour
  var suffix = ( time[0] < 12 ) ? "AM" : "PM";
 
// Convert hour from military time
 // time[0] = ( time[0] < 12 ) ? time[0] : time[0] - 12;
 
// If hour is 0, set it to 12
  time[0] = time[0] || 12;
 
// If hours seconds and minutes are less than 10, add a zero
  for ( var i = 0; i < 3; i++ ) {
    if ( time[i] < 10 ) {
      time[i] = "0" + time[i];
    }
  }
 
// Return the formatted string
  return date.join("-") + "T" + time.join(":");// + " " + suffix;
}
function ifcSetUp(fileName)
{
    var outputstring = "";
    outputstring +="ISO-10303-21;\n";
    outputstring +="HEADER;\n";
    /* NOTE a valid model view name has to be asserted, replacing 'notYetAssigned' ----------------- */
    outputstring +="FILE_DESCRIPTION(('ViewDefinition [notYetAssigned]'),'2;1');\n";
    /* NOTE standard header information according to ISO 10303-21 ---------------------------------- */
    outputstring +="FILE_NAME";
	outputstring +="('"+fileName+"',";
	outputstring +="'"+timeStamp()+"',";
	outputstring +="('R Hudson'),";
	outputstring +="('rolson'),";
	outputstring +="'IFC text editor',";
	outputstring +="'IFC text editor',";
	outputstring +="'reference file created for the IFC4 specification');\n";
    /* NOTE schema name to be replaced with 'IFC4' after the final release  ------------------------ */
    outputstring +="FILE_SCHEMA(('IFC2X3'));\n";
    outputstring +="ENDSEC;\n";
    return outputstring;
            
}

function ifcData(outputstring)
{
    var guid = fakeUID();
    outputstring +="DATA;\n";
    /* --------------------------------------------------------------------------------------------- */
    /* general entities required for all IFC data sets, defining the context for the exchange ------ */
    outputstring +="#100= IFCPROJECT('"+fakeUID()+"',#110,'proxy with surface model',$,$,$,$,(#201),#301);\n";

    /* single owner history sufficient if not otherwise required by the view definition ------------ */
    /* provides the person and application creating the data set, and the time it is created ------- */
    outputstring +="#110= IFCOWNERHISTORY(#111,#115,$,.ADDED.,1320688800,$,$,1320688800);\n";
    outputstring +="#111= IFCPERSONANDORGANIZATION(#112,#113,$);\n";
    outputstring +="#112= IFCPERSON($,'Hudson','Roland',$,$,$,$,$);\n";
    outputstring +="#113= IFCORGANIZATION($,'rolson',$,$,$);\n";
    outputstring +="#115= IFCAPPLICATION(#113,'1.0','bowlGen','ifcBG');\n";

    /* each IFC data set containing geometry has to define a geometric representation context ------ */
    /* the attribute 'ContextType' has to be 'Model' for 3D model geometry ------------------------- */
    outputstring +="#201= IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.0E-5,#210,$);\n";
    /* the attribute 'ContextIdentifier' has to be 'Body' for the main 3D shape representation ----- */
    outputstring +="#202= IFCGEOMETRICREPRESENTATIONSUBCONTEXT('Body','Model',*,*,*,*,#201,$,.MODEL_VIEW.,$);\n";
    outputstring +="#210= IFCAXIS2PLACEMENT3D(#901,$,$);\n";

    /* each IFC data set containing geometry has to define at absolute minimum length and angle ---- */
    /* here length is milli metre as SI unit, and plane angle is 'degree' as non SI unit ----------- */
    outputstring +="#301= IFCUNITASSIGNMENT((#311,#312));\n";
    outputstring +="#311= IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.);\n";
    outputstring +="#312= IFCCONVERSIONBASEDUNIT(#313,.PLANEANGLEUNIT.,'degree',#314);\n";
    outputstring +="#313= IFCDIMENSIONALEXPONENTS(0,0,0,0,0,0,0);\n";
    outputstring +="#314= IFCMEASUREWITHUNIT(IFCPLANEANGLEMEASURE(0.017453293),#315);\n";
    outputstring +="#315= IFCSIUNIT(*,.PLANEANGLEUNIT.,$,.RADIAN.);\n";

    /* each IFC data set containing elements in a building context has to include a building ------- */
    /* at absolute minimum (could have a site and stories as well) --------------------------------- */
    outputstring +="#500= IFCBUILDING('"+fakeUID()+"',#110,'Test Building','TestIFCStad',$,#511,$,'Stadium',.ELEMENT.,$,$,$);\n";
    /* if the building is the uppermost spatial structure element it defines the absolut position -- */
    outputstring +="#511= IFCLOCALPLACEMENT($,#512);\n";
    /* no rotation - z and x axes set to '$' are therefore identical to "world coordinate system" -- */ 
    outputstring +="#512= IFCAXIS2PLACEMENT3D(#901,$,$);\n";
    /* if the building is the uppermost spatial structure element it is assigned to the project ---- */
    outputstring +="#519= IFCRELAGGREGATES('"+fakeUID()+"',$,$,$,#100,(#500));\n";

    /* shared coordinates - it is permissable to share common instances to reduce file size -------- */
    outputstring +="#901= IFCCARTESIANPOINT((0.,0.,0.));\n";
    outputstring +="#902= IFCDIRECTION((1.,0.,0.));\n";
    outputstring +="#903= IFCDIRECTION((0.,1.,0.));\n";
    outputstring +="#904= IFCDIRECTION((0.,0.,1.)); ";
    outputstring +="#905= IFCDIRECTION((-1.,0.,0.));\n";
    outputstring +="#906= IFCDIRECTION((0.,-1.,0.));\n";
    outputstring +="#907= IFCDIRECTION((0.,0.,-1.));\n";
    return outputstring;
}
function ifcSurface(outputstring)
{
    /* --------------------------------------------------------------------------------------------- */
    
    /* proxy element placement relative to the building -------------------------------------------- */
    outputstring +="#1001= IFCLOCALPLACEMENT(#511,#1002);\n";
    /* set local placement to 1 meter on x-axis, and 0 on y, and 0 on z axes ----------------------- */
    /* no rotation - z and x axes set to '$' are therefore identical to those of building ---------- */
    outputstring +="#1002= IFCAXIS2PLACEMENT3D(#1003,$,$);\n";
    outputstring +="#1003= IFCCARTESIANPOINT((1000.,0.,0.));\n";
    return outputstring;
}
function ifcFace(p1,p2,p3,p4,objCount)
{
    var outputstring ="";
    var pointList = incPointList(objCount);
    objCount++;
    outputstring +=ifcPoint(rounddp(p1.x,6), rounddp(p1.y,6), rounddp(p1.z,6), objCount);
    objCount++;
    outputstring +=ifcPoint(rounddp(p2.x,6), rounddp(p2.y,6), rounddp(p2.z,6), objCount);
    objCount++;
    outputstring +=ifcPoint(rounddp(p3.x,6), rounddp(p3.y,6), rounddp(p3.z,6), objCount);
    objCount++;
    outputstring +=ifcPoint(rounddp(p4.x,6), rounddp(p4.y,6), rounddp(p4.z,6), objCount);
    objCount++;
    outputstring +="#" + objCount + "= IFCPOLYLOOP((" + pointList + "));\n";
    objCount++;
    outputstring +="#" + objCount + "= IFCFACEOUTERBOUND(#"+(objCount-1)+",.T.);\n";
    objCount++;
    outputstring +="#" + objCount + "= IFCFACE((#"+(objCount-1)+"));\n";
    return outputstring;
}
function ifcFaceFromPointSet(points,objCount)
{
    var outputstring ="";
    var pointList = "";
    for(var i =0;i<points.length;i++)
    {
        objCount++;
        outputstring +=ifcPoint(rounddp(points[i].x,6), rounddp(points[i].y,6), rounddp(points[i].z,6), objCount);
        if (i == 0)
        {
            pointList += "#" + objCount;
        }
        else
        {
            pointList += ",#" + objCount;
        }
    }
    objCount++;
    outputstring +="#" + objCount + "= IFCPOLYLOOP((" + pointList + "));\n";
    objCount++;
    outputstring +="#" + objCount + "= IFCFACEOUTERBOUND(#"+(objCount-1)+",.T.);\n";
    objCount++;
    outputstring +="#" + objCount + "= IFCFACE((#"+(objCount-1)+"));\n";
    return outputstring;
}
function rounddp(num,dp)
{
    return Math.round(num*Math.pow(10, dp))/Math.pow(10, dp);
    //Math.round(num * 100) / 100
}
function incFaceList(objCount)
{
    var faceList = "";
    for(var p =0;p<8;p++)
    {
       
        if (p == 0)
        {
        faceList += "#" + objCount;
        }
        else
        {
         faceList += ",#" + objCount;
        }
        if(p<5){objCount+=7;}
        else{objCount+=9;}
    }
    return faceList;
}
function incPointList(objCount)
{
    var pointList = "";
    for(var p =0;p<4;p++)
    {
        objCount++;
        if (p == 0)
        {
            pointList += "#" + objCount;
        }
        else
        {
            pointList += ",#" + objCount;
        }
    }
    return pointList;
}
function ifcPoint(x,y,z, objCount)
{
    
    var outputstring = "";
    if (x == 0 || y == 0 || z == 0)
    {
        if (x == 0)
        {
            outputstring +="#" + objCount + "= IFCCARTESIANPOINT((" + x + ".," + y + "," + z + "));\n";
        }
        if (y == 0)
        {
            outputstring +="#" + objCount + "= IFCCARTESIANPOINT((" + x + "," + y + ".," + z + "));\n";
        }
        if (z == 0)
        {
            outputstring +="#" + objCount + "= IFCCARTESIANPOINT((" + x + "," + y + "," + z + ".));\n";
        }
    }
    else
    {
        outputstring +="#" + objCount + "= IFCCARTESIANPOINT((" + x + "," + y + "," + z + "));\n";
    }
    return outputstring;
}
function ifcFinish(objCount)
{
    
    /* proxy element assigned to the building ------------------------------------------------------ */
    objCount++;
    var outputstring ="";
    //outputstring +="#" + objCount + "=IFCRELCONTAINEDINSPATIALSTRUCTURE('2TnxZkTXT08eDuMuhUUFNy',$,'Physical model',$,(#1000),#500);\n";

    outputstring +="ENDSEC;\n";
    outputstring +="END-ISO-10303-21;\n";
    return outputstring;
}
function S4() 
{
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
}
function getGUID()
{
    // then to call it, plus stitch in '4' in the third group
    var guid = (S4() + S4() + S4() + S4()+  S4() + S4() + S4() + S4()).toLowerCase();
    //alert(guid);
    return guid;
}
function fakeUID()
{
    var table =['0','1','2','3','4','5','6','7','8','9',
                'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
                'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
                '_','$'];
var ifcguid = "";
    for(var i=0;i<22;i++)
    {
        ifcguid+= table[Math.floor((Math.random() * 63))];
    }
    return ifcguid;
}