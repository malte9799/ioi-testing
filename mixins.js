const HandledScreenMixin = new Mixin('net.minecraft.client.gui.screen.ingame.HandledScreen');
HandledScreenMixin.widenField('x');
HandledScreenMixin.widenField('y');

const IntPropertyMixin = new Mixin('net.minecraft.state.property.IntProperty');
IntPropertyMixin.widenField('min');
IntPropertyMixin.widenField('max');

const ClientPlayerInteractionManagerMixin = new Mixin('net.minecraft.client.network.ClientPlayerInteractionManager');
export const ClientPlayerInteractionManager_breakBlock = ClientPlayerInteractionManagerMixin.inject({
	at: new At('HEAD'),
	method: 'breakBlock',
	locals: new Local({
		type: 'Lnet/minecraft/util/math/BlockPos;',
		index: 1,
	}),
});

const BlockItemMixin = new Mixin('net.minecraft.item.BlockItem');
export const BlockItem_place_head = BlockItemMixin.inject({
	at: new At('HEAD'),
	method: 'place(Lnet/minecraft/item/ItemPlacementContext;)Lnet/minecraft/util/ActionResult;',
	locals: new Local({
		type: 'Lnet/minecraft/item/ItemPlacementContext;',
		index: 1,
	}),
});
export const BlockItem_place_tail = BlockItemMixin.inject({
	at: new At('TAIL'),
	method: 'place(Lnet/minecraft/item/ItemPlacementContext;)Lnet/minecraft/util/ActionResult;',
	locals: new Local({
		type: 'Lnet/minecraft/item/ItemPlacementContext;',
		index: 1,
	}),
});