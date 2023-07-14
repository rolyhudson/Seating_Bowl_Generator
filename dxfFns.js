function dxfStringBuilderTest(phpName,dxfName){
var outputString = "";
    outputString = dxfSetUp(outputString);
    var p1= new THREE.Vector3(0,0,0);
    var p2= new THREE.Vector3(0,10,0);
    var p3= new THREE.Vector3(10,10,0);
    var p4= new THREE.Vector3(10,0,0);
    outputString = DXFquadPanel(outputString,p1,p2,p3,p4,"testlayer");
    outputString = dxfFinishOff(outputString);
    var result = pushTextToPHPwrite(phpName,dxfName,outputString,"w");
    return outputString;
}
function dxfFrom3jsMesh(mesh){
    var outputString = "";
        outputString = dxfSetUp(outputString);

    //pushTextToPHPwrite(phpName,dxfName,outputString,"w");

    for(var m=0;m<mesh.length;m++){
        
        //outputString = "";
        for(var f=0;f<mesh[m].geometry.faces.length-1;f+=2){//mesh[m].geometry.faces.length
            var p1= mesh[m].geometry.vertices[mesh[m].geometry.faces[f].a];
            var p2= mesh[m].geometry.vertices[mesh[m].geometry.faces[f+1].c];
            var p3= mesh[m].geometry.vertices[mesh[m].geometry.faces[f].b];
            var p4= mesh[m].geometry.vertices[mesh[m].geometry.faces[f].c];
            outputString = DXFquadPanel(outputString,p1,p2,p3,p4,"testlayer");
        }
       //pushTextToPHPwrite(phpName,dxfName,outputString,"a");
    }
    //outputString = "";
    outputString = dxfFinishOff(outputString);
    return outputString;
    //pushTextToPHPwrite(phpName,dxfName,outputString,"w");
}
function dxfSetUp(dxfOut)
{
    dxfOut+="0\n";
    dxfOut+="SECTION\n";
    dxfOut+="2\n";
    dxfOut+="ENTITIES\n";
    return dxfOut;
}
function  DXFquadPanel(dxfOut,p1,p2,p3,p4,layer)
{
    dxfOut+="0\n";
    dxfOut+="3DFACE\n";
    dxfOut+="8\n";
    dxfOut+=layer+"\n";//layer name
    dxfOut+="10\n"; dxfOut+=p1.x+"\n";
    dxfOut+="20\n"; dxfOut+=p1.y+"\n";
    dxfOut+="30\n"; dxfOut+=p1.z+"\n";
    dxfOut+="11\n"; dxfOut+=p2.x+"\n";
    dxfOut+="21\n"; dxfOut+=p2.y+"\n";
    dxfOut+="31\n"; dxfOut+=p2.z+"\n";
    dxfOut+="12\n"; dxfOut+=p3.x+"\n";
    dxfOut+="22\n"; dxfOut+=p3.y+"\n";
    dxfOut+="32\n"; dxfOut+=p3.z+"\n";
    dxfOut+="13\n"; dxfOut+=p4.x+"\n";
    dxfOut+="23\n"; dxfOut+=p4.y+"\n";
    dxfOut+="33\n"; dxfOut+=p4.z+"\n";
    return dxfOut;
}
function  DXFtriPanel(dxfOut,p1,p2,p3,layer)
{
    dxfOut+="0\n";
    dxfOut+="3DFACE\n";
    dxfOut+="8\n";
    dxfOut+=layer+"\n";//layer name
    dxfOut+="10\n"; dxfOut+=p1.x+"\n";
    dxfOut+="20\n"; dxfOut+=p1.y+"\n";
    dxfOut+="30\n"; dxfOut+=p1.z+"\n";
    dxfOut+="11\n"; dxfOut+=p2.x+"\n";
    dxfOut+="21\n"; dxfOut+=p2.y+"\n";
    dxfOut+="31\n"; dxfOut+=p2.z+"\n";
    dxfOut+="12\n"; dxfOut+=p3.x+"\n";
    dxfOut+="22\n"; dxfOut+=p3.y+"\n";
    dxfOut+="32\n"; dxfOut+=p3.z+"\n";
    return dxfOut;
}
function  dxfFinishOff(dxfOut)
{
    dxfOut+="0\n";
    dxfOut+="ENDSEC\n";
    dxfOut+="0\n";
    dxfOut+="EOF";
    return dxfOut;
}
function  DXFLines(dxfOut,p1, p2, layer)
{
dxfOut+="0\n";
dxfOut+="LINE\n";
dxfOut+="8\n";
dxfOut+=layer;//layer name
dxfOut+="10\n"; dxfOut+=p1.x+"\n";
dxfOut+="20\n"; dxfOut+=p1.y+"\n";
dxfOut+="30\n"; dxfOut+=p1.z+"\n";
dxfOut+="11\n"; dxfOut+=p2.x+"\n";
dxfOut+="21\n"; dxfOut+=p2.y+"\n";
dxfOut+="31\n"; dxfOut+=p2.z+"\n";
dxfOut+="62\n";
dxfOut+="1\n";//color
return dxfOut;
}
function DXFNames(dxfOut,name,x,y,z,layer)
{
    dxfOut+="0\n";
    dxfOut+="TEXT\n";
    dxfOut+="8\n";
    dxfOut+=layer+"\n";//layer name
    dxfOut+="62\n";
    dxfOut+="1\n";//color
    dxfOut+="10\n";
    dxfOut+=x+="\n";//text origin
    dxfOut+="20\n";
    dxfOut+=y+="\n"; //text origin
    dxfOut+="30\n";
    dxfOut+=z+="\n";//text origin
    dxfOut+="40\n";
    dxfOut+="0.1\n";//text height
    dxfOut+="1\n";
    dxfOut+=name+"\n";//text height and string
    return dxfOut;

}