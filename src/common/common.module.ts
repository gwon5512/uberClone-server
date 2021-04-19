import { Global, Module } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { PUB_SUB } from './common.constants';

const pubsub = new PubSub()

@Global() 
@Module({
    providers:[
        {
        provide: PUB_SUB,
        useValue: pubsub
        }
    ],
    exports:[PUB_SUB] // export 유의
}) // 전체를 위한 pubsub provide

export class CommonModule {} // $nest g mo common

// 사용하고자 하는 resolver에 @Inject(PUB_SUB) private readonly pubSub: PubSub -> 모든 곳에서 중복없이 PubSub 인스턴스 사용가능
// pubsub은 데모용으로 서버에 단일 인스턴스로 있고 여러 개의 연결로 확장하지 않는 경우에만 작동 ... 동시에 많은 서버를 가지고 있는 경우 pubsub으로 구현하면 안됨
// 만약 동시에 10개의 서버가 있는 경우 다른 별도의 pubsub 인스턴스 필요
// 10개의 서버가 있는 경우 한 서버가 트리거를 listening하는 서버가 되고, 다른 서버가 트리거에 publish 하는 서버 동일한 pubsub이 아닌 경우 작동하지 X

// pubsub을 나의 서버가 아니고 다른 분리된 서버에 저장
// graphql-redis-subscriptions
// host / port 제공
// cluster 사용시 많은 node 사용가능
