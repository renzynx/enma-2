import { ApplyOptions } from '@sapphire/decorators';
import { container, Listener, ListenerOptions } from '@sapphire/framework';
import type { Node } from 'erela.js';

@ApplyOptions<ListenerOptions>({})
export class UserEvent extends Listener {
	public constructor(context: Listener.Context, options: Listener.Options) {
		super(context, {
			...options,
			emitter: container.manager,
			event: 'nodeError'
		});
	}

	public run(node: Node, error: Error) {
		return container.logger.error(`${node.options.identifier} errored: ${error}`);
	}
}
