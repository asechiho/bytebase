import type { ComputedRef } from "vue";
import {
  type InjectionKey,
  type Ref,
  provide,
  inject,
  computed,
  ref,
} from "vue";
import { useCurrentUserV1, useSubscriptionV1Store } from "@/store";
import type { FeatureType } from "@/types";
import { State } from "@/types/proto/v1/common";
import type { Instance } from "@/types/proto/v1/instance_service";
import { DataSourceType } from "@/types/proto/v1/instance_service";
import { hasWorkspacePermissionV2 } from "@/utils";
import type { BasicInfo, DataSourceEditState, EditDataSource } from "./common";
import { extractBasicInfo, extractDataSourceEditState } from "./common";

export type InstanceFormContext = {
  instance: Ref<Instance | undefined>;
  isCreating: Ref<boolean>;
  allowEdit: Ref<boolean>;
  basicInfo: Ref<BasicInfo>;
  dataSourceEditState: Ref<DataSourceEditState>;
  hasReadonlyReplicaFeature: ComputedRef<boolean>;
  missingFeature: Ref<FeatureType | undefined>;

  // derived states
  adminDataSource: ComputedRef<EditDataSource>;
  editingDataSource: ComputedRef<EditDataSource | undefined>;
  readonlyDataSourceList: ComputedRef<EditDataSource[]>;
  hasReadOnlyDataSource: ComputedRef<boolean>;
};

const KEY = Symbol(
  "bb.workspace.instance-form"
) as InjectionKey<InstanceFormContext>;

export const provideInstanceFormContext = (
  baseContext: Pick<InstanceFormContext, "instance">
) => {
  const me = useCurrentUserV1();
  const { instance } = baseContext;
  const isCreating = computed(() => instance.value === undefined);
  const allowEdit = computed(() => {
    if (isCreating.value) return true;

    return (
      instance.value?.state === State.ACTIVE &&
      hasWorkspacePermissionV2(me.value, "bb.instances.update")
    );
  });
  const basicInfo = ref(extractBasicInfo(instance.value));
  const dataSourceEditState = ref(extractDataSourceEditState(instance.value));

  const adminDataSource = computed(() => {
    return dataSourceEditState.value.dataSources.find(
      (ds) => ds.type === DataSourceType.ADMIN
    )!;
  });
  const editingDataSource = computed(() => {
    const { dataSources, editingDataSourceId } = dataSourceEditState.value;
    if (editingDataSourceId === undefined) return undefined;
    return dataSources.find((ds) => ds.id === editingDataSourceId);
  });
  const readonlyDataSourceList = computed(() => {
    return dataSourceEditState.value.dataSources.filter(
      (ds) => ds.type === DataSourceType.READ_ONLY
    );
  });
  const hasReadOnlyDataSource = computed(() => {
    return readonlyDataSourceList.value.length > 0;
  });

  const hasReadonlyReplicaFeature = computed(() => {
    return useSubscriptionV1Store().hasInstanceFeature(
      "bb.feature.read-replica-connection",
      instance.value
    );
  });

  const missingFeature = ref<FeatureType | undefined>(undefined);

  const context: InstanceFormContext = {
    ...baseContext,
    isCreating,
    allowEdit,
    basicInfo,
    dataSourceEditState,
    adminDataSource,
    editingDataSource,
    readonlyDataSourceList,
    hasReadOnlyDataSource,
    hasReadonlyReplicaFeature,
    missingFeature,
  };
  provide(KEY, context);

  return context;
};

export const useInstanceFormContext = () => {
  return inject(KEY)!;
};
