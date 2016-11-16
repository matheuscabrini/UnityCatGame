#pragma strict

//Options
	//additional things to Spawn 
 	class spawnThing
 	{
 		var rooms : int[];
   		var Thing : GameObject;
  		var spawnPosXinPercent : float;
  		var randomXPos : float;
 		var spawnPosYinPercent : float;
 		var randomYPos : float;
 		var count : int;
 		var addRandomCount : int;
 	}
 
 	var spawners : spawnThing[];
	
	//Prefabs
	var EnvStone_Standard : GameObject;
	var EnvStone_Edge : GameObject;
	var EnvStone_Corner : GameObject;
	var EnvStone_Inner : GameObject;
	
	//Values
	var RCmin : int;
	var RCmax : int;
	var rwMin : int;
	var rwMax : int;
	var rhMin : int;
	var rhMax : int;
	var blockSize : float;
	var fillrate : int;
	var maxEntranceSize : int;
	var destroyWhenDone : boolean;
	
//private
	private var roomType : int; //first Room = -1; the random = 0; and the last = 1
	private var nextOrigin : Vector3; //Defines the Origin for the next Block being set
	private var nextFillOrigin : Vector3; //Stores the origin where the next fill Block will start
	private var nextRoomOrigin : Vector3; //Stores the origin where the next Room will start
	private var entrance : int; //Defines the height of the entrance
	private var entranceHeight : int = 0; //Defines the height of the entrance Origin! This is only used for the connection to the next room
	private var rotateModefier : int; //the modifier for the function in which direction to rotate blocks which are used by the same sprite
	private var platformOrigin : Vector3;
	private var leftEntrance : int;
	private var rightEntrance : int;
	private var fillCornerDirection : Vector3;
	private var cornerFill : boolean;
	private var spawnObject : GameObject;
	private var spawnPosXinPercent : float;
	private var spawnPosYinPercent : float;
	private var spawnedObject : GameObject;
	private var fillDirection : Vector3;

function Start () {
	roomType = -1;
	Room();
	roomType = 0;
	var roomCount : int = Random.Range(RCmin, RCmax+1);
	for (var rc : int = 0; rc != roomCount; rc++){
		Room();
	}
	roomType = 1;
	Room();
	
	if(destroyWhenDone == true){
		Destroy (gameObject);
	}
}

function Room(){
	var roomwidth : int = Random.Range(rwMin, rwMax);
	var roomheight : int = Random.Range(rhMin, rhMax);
	var roomdepth : int;
	var origin : Vector3;
	var edgespacer : int;
	var cornerOrigin : Vector3;
	var ceBlock : GameObject; // thecorner/edgeblock i just instantiated
	
	//Defines the Origin for the Room of type x
	if(roomType == -1){
		origin = transform.position + Vector3(0, blockSize, 0);
		roomdepth = 0;
		entrance = 0;
		edgespacer = 0;		
	}
	if(roomType == 0 || roomType == 1){
		origin = nextRoomOrigin + Vector3(blockSize, 0, 0);
		roomdepth = Random.Range(0, roomheight-entrance);
		
		edgespacer = 1;
		cornerOrigin = origin - Vector3(0, blockSize, 0);
		if(roomdepth > 0){
			//InstantiateCornerBlock
			ceBlock = Instantiate(EnvStone_Edge, cornerOrigin, EnvStone_Corner.transform.rotation);
			ceBlock.transform.Rotate(Vector3(0,0, -90));
		}
		cornerOrigin = origin + Vector3(0, blockSize, 0) * entrance;
		//InstantiateCornerBlock
		ceBlock = Instantiate(EnvStone_Edge, cornerOrigin, EnvStone_Corner.transform.rotation);
		ceBlock.transform.Rotate(Vector3(0,0, 180));
	}
	if(roomType == 0){
		platformOrigin = origin - Vector3(blockSize*-0.5, blockSize * roomdepth + 0.5*blockSize, 0);
	}
	
	leftEntrance = entrance;
	
	//CREATE CORNERS on left side///////////////
	
	//corner at the beginning
	if(roomType == -1){
		cornerOrigin = origin - Vector3(0, blockSize, 0); 
		ceBlock = Instantiate(EnvStone_Corner, cornerOrigin, EnvStone_Corner.transform.rotation);
		ceBlock.transform.Rotate(Vector3(0,0, -90));
		
		cornerFill = true;
		fillCornerDirection = Vector3(0, -blockSize, 0);
		//sclf just means "start corner left fill"
		fillDirection = Vector3(-blockSize, 0, 0);
		nextFillOrigin = cornerOrigin + Vector3(-blockSize, 0, 0);
		for (var sclf : int; sclf < fillrate; sclf++){
			Fill();
		}
		cornerFill = false;
	}
	
	if(roomType > -1 && roomdepth > 0){
		cornerOrigin = origin - Vector3(0, blockSize*(roomdepth+1), 0); 
		ceBlock = Instantiate(EnvStone_Corner, cornerOrigin, EnvStone_Corner.transform.rotation);
		ceBlock.transform.Rotate(Vector3(0,0, -90));
	}
	
	//standard block instead of corner when we have no depth
	if(roomdepth == 0 && (roomType == 0 || roomType == 1)){
		cornerOrigin = origin - Vector3(0, blockSize, 0); 
		ceBlock = Instantiate(EnvStone_Standard, cornerOrigin, EnvStone_Corner.transform.rotation);
	}
	
	//scdf just means "start corner down fill"
	fillDirection = Vector3(0, -blockSize, 0);
	nextFillOrigin = cornerOrigin + Vector3(0, -blockSize, 0);
	for (var scdf : int; scdf < fillrate; scdf++){
		Fill();
	}
		
	//topLeft Cornerblock
	cornerOrigin = origin + Vector3(0, blockSize, 0) * entrance + Vector3(0, blockSize, 0) *(roomheight - entrance - roomdepth); 
	ceBlock = Instantiate(EnvStone_Corner, cornerOrigin, EnvStone_Corner.transform.rotation);
	ceBlock.transform.Rotate(Vector3(0,0, 180));
	ceBlock.tag = "Floor";
	
	//tlcuf just means "top left corner up fill"
	fillDirection = Vector3(0, blockSize, 0);
	nextFillOrigin = cornerOrigin + Vector3(0, blockSize, 0);
	for (var tlcuf : int; tlcuf < fillrate; tlcuf++){
		Fill();
	}
	
	cornerFill = true;
	fillCornerDirection = Vector3(0, blockSize, 0);
	if(roomType == -1){
		//tlcfs just means "top left corner fill side"
		fillDirection = Vector3(-blockSize, 0, 0);
		nextFillOrigin = cornerOrigin + Vector3(-blockSize, 0, 0);
		for (var tlcfs : int; tlcfs < fillrate; tlcfs++){
			Fill();
		}
	}
	cornerFill = false;
	
	//toprightCornerblock
	cornerOrigin = origin + Vector3(0, blockSize, 0) *(roomheight - entrance - roomdepth) + Vector3(blockSize, 0, 0) * roomwidth + Vector3(0, blockSize, 0) * entrance; 
	ceBlock = Instantiate(EnvStone_Corner, cornerOrigin, EnvStone_Corner.transform.rotation);
	ceBlock.transform.Rotate(Vector3(0,0, 90));
	ceBlock.tag = "Floor";
	
	//trcuf just means "top right corner up fill"
	fillDirection = Vector3(0, blockSize, 0);
	nextFillOrigin = cornerOrigin + Vector3(0, blockSize, 0);
	for (var trcuf : int; trcuf < fillrate; trcuf++){
		Fill();
	}
	
	cornerFill = true;
	fillCornerDirection = Vector3(0, blockSize, 0);
	if(roomType == 1){
		//trcfs just means "top right corner fill side"
		fillDirection = Vector3(blockSize, 0, 0);
		nextFillOrigin = cornerOrigin + Vector3(blockSize, 0, 0);
		for (var trcfs : int; trcfs < fillrate; trcfs++){
			Fill();
		}
	}
	cornerFill = false;
	
	//CREATE WALLS///////////////////////////////
	
	//the sprites of the walls on the left side will be rotated by -90 degrees
	rotateModefier = -1;
	
	//the Wall that goes down from the entrance
	nextOrigin = origin - Vector3(0, blockSize, 0)*edgespacer*2; 
	for (var dwl : int; dwl < roomdepth-1; dwl++){
		DownWall();
	}
	
	//the floor goes to the right from the origin
	nextOrigin = origin - Vector3(0, blockSize, 0) * roomdepth + Vector3(blockSize, -blockSize, 0);
	fillDirection = Vector3(0, -blockSize, 0);
	for (var g : int; g < roomwidth -1; g++){
		nextFillOrigin = nextOrigin + Vector3(0, -blockSize, 0);
		Floor();
		//ffl just means floor fill
		for (var ff : int; ff < fillrate; ff++){
			Fill();
		}
	}
	
	//the Wall that goes up from the entrance
	nextOrigin = origin + Vector3(0, blockSize, 0) * (entrance + edgespacer);
	fillDirection = Vector3(-blockSize, 0, 0);
	for (var uw : int; uw < roomheight - entrance - roomdepth - edgespacer; uw++){
		nextFillOrigin = nextOrigin + Vector3(-blockSize, 0, 0);
		UpWall();
		if(roomType == -1){
			//uwfl just means "up wall fill left"
			for (var uwfl : int; uwfl < fillrate; uwfl++){
				Fill();
			}
		}
	}
	
	//the ceiling
	nextOrigin = origin + Vector3(0, blockSize, 0) * entrance + Vector3(0, blockSize, 0) *(roomheight - entrance - roomdepth) + Vector3(blockSize, 0, 0);
	fillDirection = Vector3(0, blockSize, 0);
	for (var c : int; c < roomwidth -1; c++){
		nextFillOrigin = nextOrigin + Vector3(0, blockSize, 0);
		Ceiling();
		//cf just means ceiling fill
		for (var cf : int; cf < fillrate; cf++){
			Fill();
		}
	}
		
	//preparations for the next room and the left wall
	if(roomType == -1 || roomType == 0){
		entrance = Random.Range(1, maxEntranceSize+1);
		rightEntrance = entrance;
		entranceHeight = Random.Range(0, roomheight - entrance);
		edgespacer = 1;
	}
	if(roomType == 1){
		entrance = 0;
		entranceHeight = 0;
		edgespacer = 0;
		
		//standard block instead of corner at the end of the floor if the entrancehight is > 0 (only last room)
		cornerOrigin = origin - Vector3(0, blockSize, 0) *(roomdepth+1) + Vector3(blockSize, 0, 0) * roomwidth; 
		ceBlock = Instantiate(EnvStone_Corner, cornerOrigin, EnvStone_Corner.transform.rotation);
		
		cornerFill = true;
		fillCornerDirection = Vector3(0, -blockSize, 0);
		//ecrf just means "end corner right fill"
		fillDirection = Vector3(blockSize, 0, 0);
		nextFillOrigin = cornerOrigin + Vector3(blockSize, 0, 0);
		for (var ecrf : int; ecrf < fillrate; ecrf++){
			Fill();
		}
		cornerFill = false;
	}
	
		//standard block instead of corner at the end of the floor if the entrancehight is > 0
	if(entranceHeight > 0){
		cornerOrigin = origin - Vector3(0, blockSize, 0) *(roomdepth+1) + Vector3(blockSize, 0, 0) * roomwidth; 
		ceBlock = Instantiate(EnvStone_Corner, cornerOrigin, EnvStone_Corner.transform.rotation);
	}
	//standard block instead of corner at the end of the floor if the entrancehight is zero
	if(entranceHeight == 0 && roomType < 1){
		cornerOrigin = origin - Vector3(0, blockSize, 0) *(roomdepth+1) + Vector3(blockSize, 0, 0) * roomwidth; 
		ceBlock = Instantiate(EnvStone_Standard, cornerOrigin, EnvStone_Corner.transform.rotation);
	}
	
	//ecf just means "end corner fill"
	fillDirection = Vector3(0, -blockSize, 0);
	nextFillOrigin = cornerOrigin + Vector3(0, -blockSize, 0);
	for (var ecf : int; ecf < fillrate; ecf++){
		Fill();
	}
	
	//the sprites of the walls on the left side will be rotated by -90 degrees
	rotateModefier = 1;
	
	//the Wall that goes down to the next entrance
	nextOrigin = origin + Vector3(0, blockSize, 0) *(roomheight - 1 - entrance - roomdepth) + Vector3(blockSize, 0, 0) * roomwidth + Vector3(0, blockSize, 0) * entrance; 
	fillDirection = Vector3(blockSize, 0, 0);
	for (var dwr : int; dwr < roomheight - entranceHeight - entrance - edgespacer; dwr++){
		nextFillOrigin = nextOrigin + Vector3(blockSize, 0, 0);
		DownWall();
		if(roomType == 1){
			//uwfr just means "up wall fill right"
			for (var uwfr : int; uwfr < fillrate; uwfr++){
				Fill();
			}
		}
	}
	
	//InstantiateEdgeBlock
	if(roomType < 1){
		cornerOrigin = nextOrigin;//origin + Vector3(blockSize*roomwidth, -blockSize * roomdepth + blockSize * (entranceHeight+entrance), 0);
		ceBlock = Instantiate(EnvStone_Edge, cornerOrigin, EnvStone_Edge.transform.rotation);
		ceBlock.transform.Rotate(Vector3(0,0, 90));
		ceBlock.tag = "Floor";
	}
	
	//the Wall that goes up to the next entrance
	nextOrigin = origin + Vector3(0, -blockSize, 0) * roomdepth + Vector3(blockSize, 0, 0) * roomwidth; 
	for (var uwr : int; uwr < entranceHeight - edgespacer; uwr++){
		UpWall();
	}
	
	if(entranceHeight > 0){
		//InstantiateCornerBlock
		cornerOrigin = nextOrigin; 
		ceBlock = Instantiate(EnvStone_Edge, cornerOrigin, EnvStone_Edge.transform.rotation);
	}
	
	//Debug.Log("entrance: " + entrance + " entranceheight: " + entranceHeight);
	nextRoomOrigin = origin + Vector3(0, -blockSize, 0) * roomdepth + Vector3(blockSize, 0, 0) * (roomwidth) + entranceHeight * Vector3(0, blockSize, 0);
	
	//spawners
	for(var thing in spawners){
		for(var room in thing.rooms){
			var rc : int = Random.Range(0, thing.addRandomCount+1);
			for(var oc : int; oc < thing.count + rc; oc++){
				var randX = Random.Range(-thing.randomXPos, thing.randomXPos+1);
				var randY = Random.Range(-thing.randomYPos, thing.randomYPos+1);
				if(roomType == room){
					spawnedObject = Instantiate(thing.Thing, origin + Vector3(blockSize*roomwidth*((thing.spawnPosXinPercent/100)+(randX/100)), -roomdepth*blockSize-blockSize/2 + blockSize*((thing.spawnPosYinPercent/100)+(randY/100)), 0), Quaternion.identity);
					spawnedObject.name = thing.Thing.name;
				}
			}
		}
	}	
}

function Floor (){
	var floorBlock : GameObject = Instantiate(EnvStone_Standard, nextOrigin, EnvStone_Standard.transform.rotation);
	nextOrigin = floorBlock.transform.TransformPoint(Vector3(blockSize, 0, 0));
}

function DownWall () {
	var downWallBlock : GameObject = Instantiate(EnvStone_Standard, nextOrigin, EnvStone_Standard.transform.rotation);
	nextOrigin = downWallBlock.transform.TransformPoint(Vector3(0, -blockSize, 0));
	downWallBlock.transform.Rotate(Vector3(0,0,90*rotateModefier));
	downWallBlock.tag = "Floor";
}

function UpWall () {
	var upWallBlock : GameObject = Instantiate(EnvStone_Standard, nextOrigin, EnvStone_Standard.transform.rotation);
	nextOrigin = upWallBlock.transform.TransformPoint(Vector3(0, blockSize, 0));
	upWallBlock.transform.Rotate(Vector3(0,0,90*rotateModefier));
	upWallBlock.tag = "Floor";
}

function Ceiling (){
	var ceilingBlock : GameObject = Instantiate(EnvStone_Standard, nextOrigin, EnvStone_Standard.transform.rotation);
	nextOrigin = ceilingBlock.transform.TransformPoint(blockSize, 0, 0);
	ceilingBlock.transform.Rotate(Vector3(0,0,180));
	ceilingBlock.tag = "Floor";
}

function Fill(){
	var fillBlock : GameObject = Instantiate(EnvStone_Inner, nextFillOrigin, EnvStone_Inner.transform.rotation);
	nextFillOrigin = fillBlock.transform.TransformPoint(fillDirection);
	var nextCornerFillOrigin = fillBlock.transform.TransformPoint(fillCornerDirection);
	if (cornerFill == true){
		for(var fl : int; fl < fillrate; fl++){
			var fillCornerBlock : GameObject = Instantiate(EnvStone_Inner, nextCornerFillOrigin, EnvStone_Inner.transform.rotation);
			nextCornerFillOrigin = fillCornerBlock.transform.TransformPoint(fillCornerDirection);
		}
	}
}

function Update () {
}