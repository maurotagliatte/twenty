import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('AgentPresenceEvent')
export class AgentPresenceEventDTO {
  @Field()
  id: string;

  @Field(() => String, { nullable: true })
  agentId?: string;

  @Field(() => String, { nullable: true })
  agentName?: string;

  @Field()
  toolName: string;

  @Field()
  action: string;

  @Field()
  targetKind: string;

  @Field(() => String, { nullable: true })
  objectMetadataId?: string;

  @Field(() => String, { nullable: true })
  objectNameSingular?: string;

  @Field(() => String, { nullable: true })
  objectLabel?: string;

  @Field(() => String, { nullable: true })
  fieldMetadataId?: string;

  @Field(() => String, { nullable: true })
  fieldLabel?: string;

  @Field(() => String, { nullable: true })
  viewId?: string;

  @Field(() => String, { nullable: true })
  recordId?: string;

  @Field(() => Number)
  emittedAt: number;
}
