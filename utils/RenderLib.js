const NEWLINE_REGEX = /\n|\r\n?/;

const TextLayerType = net.minecraft.client.font.TextRenderer.class_6415; // class_6415: TextLayerType
const VertexConsumers = Client.getMinecraft().getBufferBuilders().getEntityVertexConsumers();

export default class RenderLib {
	// static '3D' = Render3D;
	// static '2D' = Render2D;
	static getSlotPos(slotIndex, align = Align.TOP_LEFT) {
		align = align.split('_');
		let x = 0;
		let y = 0;
		if (align[0] == 'CENTER') y += 8;
		if (align[0] == 'BOTTOM') y += 16;
		if (align[1] == 'CENTER') x += 8;
		if (align[1] == 'RIGHT') x += 16;
		const screen = Player.getContainer().screen;
		if (!screen || !(screen instanceof net.minecraft.client.gui.screen.ingame.HandledScreen)) new Vec3i(0, 0, 0);
		const slot = screen.getScreenHandler().slots.get(slotIndex);
		return new Vec3i(x + screen.x + slot.x, y + screen.y + slot.y, 0);
	}
	static getSlotCenter(slotIndex) {
		return RenderLib.getSlotPos(slotIndex, Align.CENTER);
	}
	static getPositionMatrix() {
		return Renderer.matrixStack.toMC().peek().positionMatrix;
	}
}

export class Render2D {
	/**
	 * Draws a string of text.
	 * @param {Object} options - Options for the text.
	 * @param {string} options.text - The text to draw.
	 * @param {number} [options.x] - X-coordinate of the text.
	 * @param {number} [options.y] - Y-coordinate of the text.
	 * @param {number} [options.z] - Z-coordinate of the text.
	 * @param {number} [options.scale] - Scale of the text.
	 * @param {number} [options.color] - Color of the text.
	 * @param {boolean} [options.shadow] - Whether to draw a shadow.
	 * @param {number} [options.backgroundColor] - Background color of the text.
	 * @param {number} [options.light] - Light level of the text.
	 * @param {string} [options.align] - Alignment of the text.
	 * @return {void}
	 */
	static drawString({ text, x = 0, y = 0, z = 300, scale = 1, color = Renderer.WHITE, shadow = false, backgroundColor = Renderer.getColor(0, 0, 0, 0), light = 15, align = Align.CENTER }) {
		const TextRenderer = Renderer.getFontRenderer();
		let yOffset = 0;
		align = align.split('_');
		if (align[0] == 'CENTER') y -= (TextRenderer.fontHeight / 2) * scale;
		if (align[0] == 'BOTTOM') y -= TextRenderer.fontHeight * scale;
		if (align[1] == 'CENTER') x -= (Renderer.getStringWidth(text) / 2) * scale;
		if (align[1] == 'RIGHT') x -= Renderer.getStringWidth(text) * scale;

		Renderer.pushMatrix().translate(x, y, z).scale(scale, scale, 1);
		ChatLib.addColor(text)
			.split(NEWLINE_REGEX)
			.forEach((line, i) => {
				TextRenderer.draw(line, 0, yOffset, color, shadow, RendererUtils.getPositionMatrix(), VertexConsumers, TextLayerType.NORMAL, backgroundColor, light);
				yOffset += TextRenderer.fontHeight;
			});
		Renderer.popMatrix();
	}
	/**
	 * Draws a filled rectangle.
	 * @param {Object} options - Options for the rectangle.
	 * @param {number} [options.x] - X-coordinate of the rectangle.
	 * @param {number} [options.y] - Y-coordinate of the rectangle.
	 * @param {number} [options.z] - Z-coordinate of the rectangle.
	 * @param {number} [options.width] - Width of the rectangle.
	 * @param {number} [options.height] - Height of the rectangle.
	 * @param {number} [options.scale] - Scale of the rectangle.
	 * @param {number} [options.color] - Color of the rectangle.
	 * @param {string} [options.align] - Alignment of the rectangle.
	 * @return {void}
	 */
	static drawRect({ x = 0, y = 0, z = 200, width = 1, height = 1, scale = 1, color = Renderer.WHITE, align = Align.TOP_LEFT }) {
		align = align.split('_');
		if (align[0] == 'CENTER') y -= (height / 2) * scale;
		if (align[0] == 'BOTTOM') y -= height * scale;
		if (align[1] == 'CENTER') x -= (width / 2) * scale;
		if (align[1] == 'RIGHT') x -= width * scale;
		width *= scale;
		height *= scale;
		Renderer.pushMatrix() //
			.translate(x, y, z)
			.enableDepth()
			.drawRect(color, 0, 0, width, height)
			.popMatrix();
	}
}
export class Render3D {}

export class Align {
	static TOP_LEFT = 'TOP_LEFT';
	static TOP = 'TOP_CENTER';
	static TOP_RIGHT = 'TOP_RIGHT';
	static LEFT = 'CENTER_LEFT';
	static CENTER = 'CENTER_CENTER';
	static RIGHT = 'CENTER_RIGHT';
	static BOTTOM_LEFT = 'BOTTOM_LEFT';
	static BOTTOM = 'BOTTOM_CENTER';
	static BOTTOM_RIGHT = 'BOTTOM_RIGHT';
}
