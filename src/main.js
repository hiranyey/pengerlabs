import { k } from "./kaplayContext"

const loadAssets = async (kaplay) => {
	await kaplay.loadSprite("penger", "penger.png")
	await kaplay.loadSprite("map", "sprites/map.png")
	await kaplay.loadSprite("spike", "sprites/spike.png")
	await kaplay.loadFont("FlowerSketches", "fonts/penger.ttf");
}

k.scene("game", async (obstacles) => {
	const map = await fetch("sprites/map.json").then((res) => res.json());
	k.add([
		k.sprite("map"),
		k.pos(0, 0),
		k.scale(2),
	])
	k.setGravity(1000);
	const colliders = map.layers[4].objects;
	colliders.forEach((collider) => {
		k.add([
			k.rect(collider.width * 2, collider.height * 2),
			k.pos(collider.x * 2, collider.y * 2),
			k.opacity(0),
			k.area(),
			k.body({ isStatic: true }),
		])
	})
	const deathColliders = k.add([
		k.rect(k.width() * 1.5, 2),
		k.pos(-k.width() / 4, k.height() + 32),
		k.opacity(0),
		k.area(),
		k.body({ isStatic: true }),
		"death",
	])
	obstacles.forEach((obstacle) => {
		k.add(obstacle);
	});
	const player = k.add([
		k.pos(80, 200),
		k.sprite("penger"),
		k.area(),
		k.body(),
		k.animate(),
		"player",
	])
	k.onButtonDown("up", () => {
		if (player.isGrounded()) {
			player.jump(400);
		}
	})
	k.onButtonDown("right", () => {
		player.flipX = false;
		player.move(100, 0);
	})
	k.onButtonDown("left", () => {
		player.flipX = true;
		player.move(-100, 0);
	})
	player.onCollide("death", () => {
		player.pos.x = 80;
		player.pos.y = 256;
	})
	k.onCollide("player", "spike", (player, spike) => {
		if (spike.pos.y-spike.height> player.pos.y) {
			player.pos.x = 80;
			player.pos.y = 256;
		}
	});
});
k.scene("toolselect", () => {
	k.add([
		k.sprite("map"),
		k.pos(0, 0),
		k.scale(2),
	])
	const text = k.add([
		k.text("Select tool", {
			font: "FlowerSketches",
			size: 32,
		}),
		k.pos(k.width() / 2, k.height() / 3),
		k.color(0, 0, 0),
		k.anchor("center"),
	])
	const greybox = k.add([
		k.circle(32),
		k.pos(k.width() / 2, k.height() / 2 + 8),
		k.outline(2, [0, 0, 0]),
		k.anchor("center"),
		k.area(),
		"greybox",
	])
	const spikeBox = k.add([
		k.sprite("spike"),
		k.pos(k.width() / 2, k.height() / 2),
		k.area({
			shape: new k.Rect(k.vec2(), 16, 22),
			offset: k.vec2(0, 6),
		}),
		k.body({ isStatic: true }),
		k.outline(2, [0, 0, 0]),
		k.scale(1.5),
		k.anchor("center"),
		"spike",
	])

	k.onHoverUpdate("greybox", () => {
		const t = k.time() * 10;
		greybox.color = k.hsl2rgb((t / 10) % 1, 0.6, 0.7);
		greybox.scale = k.vec2(1.2);
		k.setCursor("pointer");
	});
	k.onHoverEnd("greybox", () => {
		greybox.color = k.rgb(255, 255, 255);
		greybox.scale = k.vec2(1);
		k.setCursor("default");
	});
	greybox.onClick(() => {
		greybox.destroy();
		const u = k.onUpdate(() => {
			spikeBox.pos = k.mousePos();
		})
		setTimeout(() => {
			k.onClick(() => {
				text.destroy();
				u.cancel();
				k.go("game", [spikeBox]);
			})
		})

	});

})

await loadAssets(k);
k.go("toolselect");