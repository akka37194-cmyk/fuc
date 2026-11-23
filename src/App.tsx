import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { createCityRenderer } from './renderer';
import { Activity, CarFront, Compass, Crosshair, GraduationCap, HeartPulse, MapPin, Maximize2, RotateCcw, Settings2, Wallet, Zap } from 'lucide-react';

type Place = { name: string; kind: string; x: number; z: number; color: number; description: string };
const places: Place[] = [
  { name: 'Central High School', kind: 'EDUCATION', x: -17, z: -15, color: 0xc58b54, description: 'Campus discovered. Classes, library and sports activities are coming soon.' },
  { name: 'City Medical Centre', kind: 'HEALTHCARE', x: 19, z: -17, color: 0x6d9fa0, description: 'Medical centre discovered. Reception and emergency services are planned.' },
  { name: 'Market Square', kind: 'SHOPPING', x: -19, z: 17, color: 0xb48c58, description: 'Market discovered. Shops and local businesses are planned.' },
  { name: 'Your Residence', kind: 'HOME', x: 18, z: 18, color: 0x8a9c79, description: 'Home discovered. Rest, save and plan your next day.' }
];

export default function App() {
  const mount = useRef<HTMLDivElement>(null);
  const game = useRef<any>(null);
  const keys = useRef<Record<string, boolean>>({});
  const [mode, setMode] = useState<'walking' | 'driving'>('walking');
  const [cameraMode, setCameraMode] = useState<'third' | 'first'>('third');
  const [nearby, setNearby] = useState('Explore the city');
  const [notice, setNotice] = useState('Welcome to REAL WORLD. Your story starts here.');
  const [money, setMoney] = useState(2500);
  const [speed, setSpeed] = useState(0);
  const [activity, setActivity] = useState('Free roam');
  const [guide, setGuide] = useState(true);

  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x9bb7c2);
    scene.fog = new THREE.Fog(0x9bb7c2, 55, 175);
    const camera = new THREE.PerspectiveCamera(68, host.clientWidth / host.clientHeight, 0.1, 500);
    const renderer = createCityRenderer(scene);
    renderer.setSize(host.clientWidth, host.clientHeight);
    host.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xd9edff, 0x64705c, 2.1));
    const sun = new THREE.DirectionalLight(0xffe0b3, 3.1);
    sun.position.set(-35, 55, 25); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); scene.add(sun);
    const material = (color: number, roughness = .82, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), material(0x71816d));
    ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

    const roadMat = material(0x303941), lineMat = material(0xe8d9a8);
    for (let i = -2; i <= 2; i++) {
      const a = new THREE.Mesh(new THREE.PlaneGeometry(13, 230), roadMat);
      a.rotation.x = -Math.PI / 2; a.position.set(i * 42, .025, 0); scene.add(a);
      const b = new THREE.Mesh(new THREE.PlaneGeometry(230, 13), roadMat);
      b.rotation.x = -Math.PI / 2; b.position.set(0, .026, i * 42); scene.add(b);
      for (let d = -100; d <= 100; d += 8) {
        const da = new THREE.Mesh(new THREE.PlaneGeometry(.22, 3.2), lineMat);
        da.rotation.x = -Math.PI / 2; da.position.set(i * 42, .045, d); scene.add(da);
        const db = new THREE.Mesh(new THREE.PlaneGeometry(3.2, .22), lineMat);
        db.rotation.x = -Math.PI / 2; db.position.set(d, .046, i * 42); scene.add(db);
      }
    }

    const buildingColors = [0xb9b1a2, 0x87999b, 0xb9a18a, 0x727f83, 0xc7c0ae, 0x8d9a8b];
    const glass = material(0x9dc3c8, .28, .25);
    for (let x = -2; x <= 2; x++) for (let z = -2; z <= 2; z++) {
      if (x === 0 && z === 0) continue;
      const bx = x * 42 + (x < 0 ? 19 : -19), bz = z * 42 + (z < 0 ? 19 : -19);
      for (let k = 0; k < 2; k++) {
        const px = bx + (k ? 7 : -7), pz = bz + (k ? -6 : 6);
        const h = 7 + (Math.abs(x * 7 + z * 11 + k * 5) % 5) * 2.2;
        const building = new THREE.Mesh(new THREE.BoxGeometry(9, h, 10), material(buildingColors[Math.abs(x + z + k) % buildingColors.length]));
        building.position.set(px, h / 2 + .2, pz); building.castShadow = true; scene.add(building);
        const roof = new THREE.Mesh(new THREE.BoxGeometry(9.2, .3, 10.2), material(0x555e5e));
        roof.position.set(px, h + .35, pz); scene.add(roof);
        for (let floor = 1; floor < Math.floor(h / 2.5); floor++) {
          const band = new THREE.Mesh(new THREE.BoxGeometry(9.03, .75, .08), glass);
          band.position.set(px, floor * 2.5, pz + 5.04); scene.add(band);
        }
      }
    }

    places.forEach((p, i) => {
      const g = new THREE.Group();
      const h = i === 0 ? 8 : 7;
      const block = new THREE.Mesh(new THREE.BoxGeometry(i === 0 ? 15 : 13, h, 12), material(p.color));
      block.position.y = h / 2 + .3; block.castShadow = true; g.add(block);
      const roof = new THREE.Mesh(new THREE.BoxGeometry(14, .5, 12.5), material(0x39474a));
      roof.position.y = h + .55; g.add(roof);
      const windows = new THREE.Mesh(new THREE.BoxGeometry(11, 3.2, .15), glass);
      windows.position.set(0, 3.1, 6.08); g.add(windows);
      g.position.set(p.x, 0, p.z); scene.add(g);
    });

    const treeTrunk = material(0x66513d), leaves = [0x526e53, 0x617b59, 0x71835b];
    for (let i = 0; i < 42; i++) {
      const x = (i * 23) % 180 - 90, z = (i * 37) % 180 - 90;
      if (Math.abs(x % 42) < 9 || Math.abs(z % 42) < 9) continue;
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.22, .32, 2.4, 7), treeTrunk);
      trunk.position.set(x, 1.2, z); scene.add(trunk);
      const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.35 + (i % 3) * .18, 1), material(leaves[i % 3]));
      crown.position.set(x, 3.15, z); scene.add(crown);
    }

    const player = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(.48, .95, 4, 8), material(0x263e50));
    body.position.y = 1.18; body.castShadow = true; player.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(.32, 16, 12), material(0xc58d69));
    head.position.y = 2.05; player.add(head); player.position.set(0, 0, 3); scene.add(player);

    const car = new THREE.Group();
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.25, .72, 4.2), new THREE.MeshStandardMaterial({ color: 0xb64f36, metalness: .58, roughness: .28 }));
    chassis.position.y = .85; chassis.castShadow = true; car.add(chassis);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.82, .78, 2.05), material(0x263a43, .25, .2));
    cabin.position.set(0, 1.55, -.18); car.add(cabin);
    const wheels: THREE.Mesh[] = [];
    for (const x of [-1.12, 1.12]) for (const z of [-1.35, 1.35]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(.43, .43, .28, 18), material(0x202426));
      wheel.rotation.z = Math.PI / 2; wheel.position.set(x, .48, z); car.add(wheel); wheels.push(wheel);
    }
    car.position.set(5, 0, 5); scene.add(car);

    const pedestrians: { group: THREE.Group; x: number; z: number; phase: number }[] = [];
    for (let i = 0; i < 12; i++) {
      const npc = new THREE.Group();
      const torso = new THREE.Mesh(new THREE.CapsuleGeometry(.28, .7, 3, 6), material([0x526c79, 0x8d604d, 0x65704e, 0x7b6685][i % 4]));
      torso.position.y = .95; npc.add(torso);
      const face = new THREE.Mesh(new THREE.SphereGeometry(.22, 10, 8), material(0xb98564));
      face.position.y = 1.72; npc.add(face);
      const x = -25 + (i % 4) * 16, z = -28 + Math.floor(i / 4) * 19;
      npc.position.set(x, 0, z); scene.add(npc); pedestrians.push({ group: npc, x, z, phase: i * .8 });
    }

    let saved: any = {};
    try { saved = JSON.parse(localStorage.getItem('rw-save') || '{}'); } catch { saved = {}; }
    player.position.set(saved.x || 0, 0, saved.z ?? 3);
    const state = { player, car, camera, renderer, mode: 'walking' as 'walking' | 'driving', cameraMode: saved.cameraMode === 'first' ? 'first' as const : 'third' as const, yaw: 0, carYaw: 0, velocity: 0, active: true, pedestrians, wheels, money: Number(saved.money) || 2500 };
    setMoney(state.money); setCameraMode(state.cameraMode);

    const clock = new THREE.Clock();
    const frame = () => {
      if (!state.active) return;
      requestAnimationFrame(frame);
      const dt = Math.min(clock.getDelta(), .04), pressed = keys.current;
      const forward = pressed.KeyW || pressed.ArrowUp, back = pressed.KeyS || pressed.ArrowDown;
      const left = pressed.KeyA || pressed.ArrowLeft, right = pressed.KeyD || pressed.ArrowRight;
      if (state.mode === 'walking') {
        let dx = (right ? 1 : 0) - (left ? 1 : 0), dz = (back ? 1 : 0) - (forward ? 1 : 0);
        const len = Math.hypot(dx, dz), pace = pressed.ShiftLeft ? 9.2 : 5.2;
        if (len) { dx /= len; dz /= len; state.yaw = Math.atan2(dx, dz); player.position.x += dx * pace * dt; player.position.z += dz * pace * dt; }
        player.position.x = THREE.MathUtils.clamp(player.position.x, -108, 108);
        player.position.z = THREE.MathUtils.clamp(player.position.z, -108, 108);
        player.rotation.y = state.yaw;
      } else {
        if (forward) state.velocity = Math.min(state.velocity + 10 * dt, 23);
        else if (back) state.velocity = Math.max(state.velocity - 14 * dt, -7);
        else state.velocity *= Math.pow(.91, dt * 60);
        if (left) state.carYaw += 1.55 * dt * (state.velocity >= 0 ? 1 : -1);
        if (right) state.carYaw -= 1.55 * dt * (state.velocity >= 0 ? 1 : -1);
        car.rotation.y = state.carYaw;
        car.position.x = THREE.MathUtils.clamp(car.position.x + Math.sin(state.carYaw) * state.velocity * dt, -112, 112);
        car.position.z = THREE.MathUtils.clamp(car.position.z + Math.cos(state.carYaw) * state.velocity * dt, -112, 112);
        wheels.forEach(w => w.rotation.x += state.velocity * dt * 1.8);
        player.position.copy(car.position);
      }
      pedestrians.forEach(p => {
        p.group.position.x = p.x + Math.sin(clock.elapsedTime * .35 + p.phase) * 2.3;
        p.group.position.z = p.z + Math.cos(clock.elapsedTime * .27 + p.phase) * 1.6;
      });
      const focus = state.mode === 'driving' ? car.position : player.position;
      const closest = places.map(p => ({ ...p, distance: Math.hypot(p.x - focus.x, p.z - focus.z) })).sort((a, b) => a.distance - b.distance)[0];
      const carDistance = player.position.distanceTo(car.position);
      const nextNearby = state.mode === 'walking' && carDistance < 3.5 ? 'Your vehicle · Press F to drive' : closest.distance < 12 ? closest.name + ' · Press E to explore' : 'Explore the city';
      setNearby(old => old === nextNearby ? old : nextNearby);
      if (state.mode === 'driving') {
        camera.position.set(car.position.x - Math.sin(state.carYaw) * 8, 4.4, car.position.z - Math.cos(state.carYaw) * 8);
        camera.lookAt(car.position.x, 1.1, car.position.z);
      } else if (state.cameraMode === 'first') {
        camera.position.set(player.position.x, 1.72, player.position.z);
        camera.rotation.order = 'YXZ'; camera.rotation.y = state.yaw; camera.rotation.x = 0;
      } else {
        camera.position.lerp(new THREE.Vector3(player.position.x - Math.sin(state.yaw) * 6.5, 3.6, player.position.z + Math.cos(state.yaw) * 6.5), .12);
        camera.lookAt(player.position.x, 1.2, player.position.z);
      }
      renderer.render(scene, camera);
      setSpeed(Math.round(Math.abs(state.velocity) * 3.6));
    };
    frame();
    game.current = state;
    const resize = () => { camera.aspect = host.clientWidth / host.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(host.clientWidth, host.clientHeight); };
    const down = (e: KeyboardEvent) => {
      if (['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
      keys.current[e.code] = true;
      if (e.repeat) return;
      if (e.code === 'KeyC') {
        state.cameraMode = state.cameraMode === 'third' ? 'first' : 'third'; setCameraMode(state.cameraMode);
      }
      if (e.code === 'KeyF') {
        if (state.mode === 'walking' && player.position.distanceTo(car.position) < 5) {
          state.mode = 'driving'; state.velocity = 0; setMode('driving'); setActivity('Driving'); setNotice('You entered your car. Use W A S D to drive.');
        } else if (state.mode === 'driving') {
          state.mode = 'walking'; player.position.x += 2.5; player.position.z += 1.5; setMode('walking'); setActivity('Free roam'); setNotice('You left the vehicle.');
        }
      }
      if (e.code === 'KeyE' && state.mode === 'walking') {
        const p = places.map(v => ({ ...v, distance: Math.hypot(v.x - player.position.x, v.z - player.position.z) })).sort((a,b) => a.distance - b.distance)[0];
        if (p && p.distance < 13) { setActivity(p.name); setNotice(p.description); if (p.kind === 'SHOPPING') { state.money = Math.max(0, state.money - 25); setMoney(state.money); } }
        else setNotice('Nothing nearby to interact with. Explore a landmark or find your car.');
      }
    };
    const up = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    window.addEventListener('resize', resize); window.addEventListener('keydown', down); window.addEventListener('keyup', up);
    const save = () => {
      localStorage.setItem('rw-save', JSON.stringify({ x: state.mode === 'driving' ? car.position.x : player.position.x, z: state.mode === 'driving' ? car.position.z : player.position.z, money: state.money, cameraMode: state.cameraMode }));
    };
    const timer = window.setInterval(save, 4000);
    return () => {
      state.active = false; save(); window.clearInterval(timer);
      window.removeEventListener('resize', resize); window.removeEventListener('keydown', down); window.removeEventListener('keyup', up);
      if ('dispose' in renderer) renderer.dispose(); if (host.contains(renderer.domElement)) host.removeChild(renderer.domElement);
      game.current = null;
    };
  }, []);

  const switchCamera = () => {
    if (!game.current) return;
    game.current.cameraMode = game.current.cameraMode === 'third' ? 'first' : 'third';
    setCameraMode(game.current.cameraMode);
  };
  const reset = () => {
    if (!game.current) return;
    game.current.mode = 'walking'; game.current.velocity = 0; game.current.player.position.set(0,0,3); game.current.car.position.set(5,0,5);
    setMode('walking'); setSpeed(0); setActivity('Free roam'); setNotice('Position reset. Explore the city!');
  };
  const hold = (key: string, value: boolean) => { keys.current[key] = value; };
  const interact = () => {
    const s = game.current; if (!s) return;
    const p = places.map(v => ({ ...v, distance: Math.hypot(v.x - s.player.position.x, v.z - s.player.position.z) })).sort((a,b) => a.distance - b.distance)[0];
    if (p.distance < 15) { setActivity(p.name); setNotice(p.description); } else setNotice('Explore closer to a landmark.');
  };
  const carAction = () => {
    const s = game.current; if (!s) return;
    if (s.mode === 'driving') { s.mode = 'walking'; setMode('walking'); setNotice('You left the vehicle.'); }
    else if (s.player.position.distanceTo(s.car.position) < 12) { s.mode = 'driving'; setMode('driving'); setNotice('You entered your car.'); }
    else setNotice('Walk closer to your red car to enter.');
  };

  return <main className="game-shell">
    <div className="world" ref={mount} /><div className="vignette" />
    <header className="topbar">
      <div className="brand"><div className="brand-mark">RW</div><div><div className="brand-name">REAL WORLD</div><div className="brand-sub">LIFE SIMULATION UNIVERSE</div></div></div>
      <div className="server-pill"><span className="live-dot" /> CITY SERVER <b>01</b></div>
      <div className="top-actions"><span className="weather">☀ <b>28°</b> <small>Clear sky</small></span><button className="icon-btn" onClick={() => setGuide(!guide)} title="Controls"><Settings2 size={17} /></button><button className="icon-btn" onClick={reset} title="Reset position"><RotateCcw size={17} /></button></div>
    </header>
    <section className="left-panel">
      <div className="eyebrow">YOUR DAY · MONDAY</div><div className="clock">09:41 <span>AM</span></div>
      <div className="location"><MapPin size={13} /> CENTRAL DISTRICT, INDIA</div><div className="panel-rule" />
      <div className="stat-line"><span><Wallet size={14} /> Wallet</span><strong>₹{money.toLocaleString('en-IN')}</strong></div>
      <div className="stat-line"><span><HeartPulse size={14} /> Health</span><strong className="good">100%</strong></div>
      <div className="stat-line"><span><Zap size={14} /> Energy</span><strong>92%</strong></div><div className="panel-rule" />
      <div className="eyebrow">CURRENT ACTIVITY</div><div className="activity-name"><Activity size={15} /> {activity}</div>
      <div className="objective"><span className="objective-dot" /> Free exploration enabled</div>
    </section>
    <section className="right-panel">
      <div className="map-heading"><span>WORLD NAV</span><Compass size={15} /></div>
      <div className="mini-map"><div className="map-road road-v" /><div className="map-road road-h" /><div className="map-road road-d" />
        <span className="map-pin pin-you">YOU</span><span className="map-pin pin-school"><GraduationCap size={12} /></span><span className="map-pin pin-hospital"><HeartPulse size={12} /></span>
        <span className="map-north">N</span></div>
      <div className="map-footer"><span><i className="legend-you" /> You</span><span><i className="legend-place" /> Locations</span></div><div className="panel-rule" />
      <div className="eyebrow">NEARBY LOCATION</div><div className="nearby-name">{nearby}</div>
    </section>
    <div className="center-toast"><span className="toast-mark">✦</span>{notice}</div>
    <div className="crosshair"><Crosshair size={18} /></div>
    <div className="bottom-hud">
      <div className="mode-card"><div className="mode-icon"><CarFront size={18} /></div><div><small>{mode === 'driving' ? 'VEHICLE SPEED' : 'MOVEMENT MODE'}</small><strong>{mode === 'driving' ? speed + ' KM/H' : 'ON FOOT'}</strong></div></div>
      <div className="controls-hint"><span>W A S D <small>MOVE / DRIVE</small></span><span>E <small>INTERACT</small></span><span>F <small>ENTER CAR</small></span><span>C <small>CAMERA</small></span></div>
      <button className="camera-btn" onClick={switchCamera}><Maximize2 size={15} /> {cameraMode === 'third' ? 'THIRD PERSON' : 'FIRST PERSON'}</button>
    </div>
    {guide && <aside className="guide-card"><button className="guide-close" onClick={() => setGuide(false)}>×</button><div className="eyebrow">QUICK CONTROLS</div><h3>Make this world yours.</h3><p>Walk the streets, discover places and get behind the wheel.</p><div className="guide-keys"><span><b>W A S D</b> Move</span><span><b>E</b> Explore location</span><span><b>F</b> Enter / exit car</span><span><b>C</b> Switch camera</span><span><b>SHIFT</b> Sprint</span></div><div className="guide-tip">TIP · Walk close to the red car to enter it.</div></aside>}
    <div className="touch-controls">
      <div className="dpad"><button onPointerDown={() => hold('KeyW',true)} onPointerUp={() => hold('KeyW',false)} onPointerLeave={() => hold('KeyW',false)}>▲</button><div>
        <button onPointerDown={() => hold('KeyA',true)} onPointerUp={() => hold('KeyA',false)} onPointerLeave={() => hold('KeyA',false)}>◀</button>
        <button onPointerDown={() => hold('KeyS',true)} onPointerUp={() => hold('KeyS',false)} onPointerLeave={() => hold('KeyS',false)}>▼</button>
        <button onPointerDown={() => hold('KeyD',true)} onPointerUp={() => hold('KeyD',false)} onPointerLeave={() => hold('KeyD',false)}>▶</button>
      </div></div>
      <div className="touch-actions"><button onClick={switchCamera}>CAM</button><button onClick={carAction}>CAR</button><button onClick={interact}>USE</button></div>
    </div>
    <div className="build-tag">◈ PROTOTYPE BUILD 0.1 <span>·</span> AUTOSAVE ON</div>
  </main>;
}
