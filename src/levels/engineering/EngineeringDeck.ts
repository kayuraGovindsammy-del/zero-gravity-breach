import * as THREE from 'three';
import { ReactorAssembly } from './ReactorAssembly';
import { Storage } from './Storage';
import { ControlRoom } from './ControlRoom';
import { GravityLaboratory } from './GravityLaboratory';


export class EngineeringDeck {
  group = new THREE.Group();
  private reactor: ReactorAssembly;
  private storage: Storage;
  private controlRoom: ControlRoom;
  private gravityLab: GravityLaboratory;
  private warningLights: THREE.PointLight[] = [];
  private t = 0;
  private hull = new THREE.MeshStandardMaterial({ color: 0x253849, metalness: 0.65, roughness: 0.53 });
  private trim = new THREE.MeshStandardMaterial({ color: 0x40566a, metalness: 0.8, roughness: 0.38 });
  private dark = new THREE.MeshStandardMaterial({ color: 0x101d2b, metalness: 0.65, roughness: 0.58 });
  private glow = new THREE.MeshStandardMaterial({ color: 0x6acaff, emissive: 0x147fca, emissiveIntensity: 2.5 });
  private red = new THREE.MeshStandardMaterial({ color: 0xb94a32, emissive: 0x9d240e, emissiveIntensity: 1.7 });

  constructor() {
    // Main bay x [-18,18], z [-16,16], y [0,14]. Three adjoining rooms.
    this.room(0, 0, 36, 32, 14, 'MAIN ENGINEERING', [
      {side:'north', center:0, width:5}, {side:'west',center:0,width:5},
      {side:'east',center:0,width:5}
    ]);
    this.room(-25, 0, 14, 16, 9, 'CARGO STORAGE', [{side:'east',center:0,width:5}]);
    this.room(25, 0, 14, 16, 9, 'GRAVITY LAB', [{side:'west',center:0,width:5}]);
    this.room(0, -23, 16, 14, 9, 'CONTROL ROOM', [{side:'south',center:0,width:5}]);
    // Corridor connectors have open ends and continuous floors.
    this.reactor = new ReactorAssembly();
    this.group.add(this.reactor.group);
    this.storage = new Storage();
    this.group.add(this.storage.group);
    this.controlRoom = new ControlRoom();
    this.group.add(this.controlRoom.group);
    this.gravityLab = new GravityLaboratory();
    this.group.add(this.gravityLab.group);
    this.addDecor();
  }

  private box(w:number,h:number,d:number,x:number,y:number,z:number,mat:THREE.Material, solid=true, target=false,label='') {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
    m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;
    m.userData.solid=solid;m.userData.gravitySurface=target;m.userData.gravityLabel=label;
    this.group.add(m);return m;
  }
  private room(cx:number,cz:number,w:number,d:number,h:number,name:string,doors:{side:string,center:number,width:number}[]) {
    this.box(w,.5,d,cx,-.25,cz,this.hull,true,true,name+' FLOOR');
    this.box(w,.5,d,cx,h+.25,cz,this.hull,true,true,name+' CEILING');
    const t=.5, doorH=5.5;
    const wall=(side:string)=>{
      const alongZ=side==='east'||side==='west';
      const length=alongZ?d:w;
      const center=alongZ?cz:cx;
      const fixed=alongZ?cx+(side==='east'?w/2:-w/2):cz+(side==='south'?d/2:-d/2);
      const opening=doors.find(v=>v.side===side);
      const segment=(start:number,end:number,height:number,cy:number)=>{
        if(end-start<.01)return;
        const p=(start+end)/2;
        if(alongZ)this.box(t,height,end-start,fixed,cy,p,this.hull,true,true,name+' WALL');
        else this.box(end-start,height,t,p,cy,fixed,this.hull,true,true,name+' WALL');
      };
      if(opening){
        const a=center-length/2,b=center+length/2;
        segment(a,center+opening.center-opening.width/2,h,h/2);
        segment(center+opening.center+opening.width/2,b,h,h/2);
        segment(center+opening.center-opening.width/2,center+opening.center+opening.width/2,h-doorH,(h+doorH)/2);
      } else segment(center-length/2,center+length/2,h,h/2);
    };
    ['north','south','west','east'].forEach(wall);
    const light = new THREE.PointLight(name==='GRAVITY LAB'?0x9966ff:0x7cb9e7, name==='CARGO STORAGE'?85:145, 23);
    light.position.set(cx,h-1,cz);this.group.add(light);
    for(let i=-1;i<=1;i++){
      this.box(1.9,.13,.5,cx+i*w/4,h-.12,cz,this.glow,false);
    }
    // Visible ceiling and floor ribs: visuals only, not physics obstacles.
    for(let i=-2;i<=2;i++){
      const x=cx+i*w/6;
      this.box(.22,.12,d-.9,x,h-.13,cz,this.trim,false);
      this.box(.12,.045,d-.9,x,.035,cz,this.trim,false);
    }
    // Perimeter orange emergency lamps.
    for(const dx of [-w*.36,w*.36]){
      this.box(1.3,.14,.14,cx+dx,h-1,cz-d/2+.4,this.red,false);
      const lamp=new THREE.PointLight(0xff562b,18,9);
      lamp.position.set(cx+dx,h-1,cz-d/2+1);this.group.add(lamp);this.warningLights.push(lamp);
    }
  }
  private addDecor(){
    // Solid machinery, crates, raised console and wall-mounted equipment.
    for(const [x,z,w,h,d] of [[-11,8,3,2.2,3],[-12,11,3,1.5,2],[11,10,3,2.5,2],[-26,-3,2.5,2,2.5],[-23,3,3,1.4,2]]){
      this.box(w,h,d,x,h/2,z,this.dark,true);
      this.box(w*.8,.09,d*.8,x,h+.055,z,this.trim,false);
    }
    for(const z of [-10,-5,5,10]){
      this.box(.4,7,.4,-17.55,5,z,this.trim,false);
      this.box(.4,7,.4,17.55,5,z,this.trim,false);
    }
    // Overhead pipes and conduits.
    const pipeMat=new THREE.MeshStandardMaterial({color:0x708797,metalness:.9,roughness:.3});
    for(const x of [-14,14])for(const y of [10.5,12]){
      const pipe=new THREE.Mesh(new THREE.CylinderGeometry(.19,.19,29,12),pipeMat);
      pipe.rotation.x=Math.PI/2;pipe.position.set(x,y,0);this.group.add(pipe);
    }
    // Elevated platform for wall-walking exploration (solid).
    this.box(9,.45,3,0,9,-12,this.trim,true);
    this.box(2,.15,1.1,0,9.3,-12,this.glow,false);
    // Consoles in control room.
    for(const x of [-4,0,4]){
      this.box(2.7,1.5,1.4,x,.75,-26,this.dark,true);
      this.box(2.1,1.1,.12,x,2,-26.5,this.glow,false);
    }
    
    
    // Door frame leading toward crew quarters: currently sealed.
    this.box(6,.5,.6,0,6,-29.65,this.trim,false);
    this.box(.5,6,.6,-3,3,-29.65,this.trim,false);
    this.box(.5,6,.6,3,3,-29.65,this.trim,false);
    this.box(5.5,5.5,.4,0,2.75,-29.75,this.red,true);
  }
  update(dt:number){this.t+=dt;this.reactor.update(dt);
    for(let i=0;i<this.warningLights.length;i++)this.warningLights[i].intensity=13+8*Math.max(0,Math.sin(this.t*2.4+i));
    this.storage.update(dt);
    this.controlRoom.update(dt);
    this.gravityLab.update(dt);
  }
}
