import { ApplyOptions } from '@sapphire/decorators';
import { container, Listener, ListenerOptions } from '@sapphire/framework';
import type { Node } from 'erela.js';

@ApplyOptions<ListenerOptions>({})
export class UserEvent extends Listener {
	public constructor(context: Listener.Context, options: Listener.Options) {
		super(context, {
			...options,
			emitter: container.manager,
			event: 'nodeConnect'
		});
	}

	public run(node: Node) {
		return container.logger.info(`Connected to ${node.options.identifier}`);
	}
}
