<template>
  <div class="ml-3 min-w-0 flex-1">
    <div class="min-w-0 flex-1 pt-1 flex justify-between">
      <div class="text-sm text-control-light space-x-1">
        <ActionCreator
          v-if="
            extractUserResourceName(activity.creator) !== SYSTEM_BOT_EMAIL ||
            activity.action === LogEntity_Action.ACTION_ISSUE_COMMENT_CREATE
          "
          :activity="activity"
        />

        <ActionSentence :issue="issue" :activity="activity" />

        <HumanizeTs
          :ts="(activity.createTime?.getTime() ?? 0) / 1000"
          class="ml-1"
        />

        <span
          v-if="
            activity.createTime?.getTime() !== activity.updateTime?.getTime() &&
            activity.action == LogEntity_Action.ACTION_ISSUE_COMMENT_CREATE
          "
        >
          <span>({{ $t("common.edited") }}</span>
          <HumanizeTs
            :ts="(activity.updateTime?.getTime() ?? 0) / 1000"
            class="ml-1"
          />)
        </span>

        <span
          v-if="similar.length > 0"
          class="text-sm font-normal text-gray-400 ml-1"
        >
          {{
            $t("activity.n-similar-activities", {
              count: similar.length + 1,
            })
          }}
        </span>
      </div>

      <slot name="subject-suffix"></slot>
    </div>
    <div class="mt-2 text-sm text-control whitespace-pre-wrap">
      <slot name="comment" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { ComposedIssue } from "@/types";
import { SYSTEM_BOT_EMAIL } from "@/types";
import type { LogEntity } from "@/types/proto/v1/logging_service";
import { LogEntity_Action } from "@/types/proto/v1/logging_service";
import { extractUserResourceName } from "@/utils";
import ActionCreator from "./ActionCreator.vue";
import ActionSentence from "./ActionSentence.vue";

defineProps<{
  issue: ComposedIssue;
  index: number;
  activity: LogEntity;
  similar: LogEntity[];
}>();
</script>
