import { Injectable, Injector } from "async-injection";

@Injectable()
class EmbedResolverService {
	
}

export async function embedResolverFactory(injector: Injector) {
	return new EmbedResolverService();
}

export default EmbedResolverService;
