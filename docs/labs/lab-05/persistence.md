# EquipFlow persistence across restart and redeploy

**Lab 5 L5-7 · C-05 · R-04**

[Issue #27](https://github.com/NxNxmm/CPE334-Sec01-Team45/issues/27) · [Deployment runbook](deployment.md)

The demo borrower created a request for `CPE-OSC-002` on November 21 at 19:15:07.470 ICT. The identifying note is `LAB5-C05-20261121T1912ICT` and its request ID is `cmwqdf5ji0001s60101l4203z`. The note was chosen before submission. The API's `createdAt` records the creation time.

On November 22, we used the existing synthetic request as the baseline. In Cloud Run, **Redeploy → Deploy new revision** with no service configuration changes replaced the application instances on the same runtime image. Cloud SQL remained running. We refreshed **My Requests**, called `GET /api/v1/requests/my`, and checked `/api/health` and `/api/ready` at each checkpoint. The checkpoint table uses Cloud Run's serving platform digest, with the registry digest linked in the deploy log.

| Checkpoint and API capture time | Serving revision (100%) | Cloud Run platform digest | Rollout source | Evidence |
| --- | --- | --- | --- | --- |
| Before restart · 19:22:39 ICT | `equipflow-00006-w4d` | `sha256:604e51553a794404a063f40bdbaa8d037ee94dd72c92a87a9a2b47ae65f3f7a0` | [Deploy run 44904873536](https://github.com/NxNxmm/CPE334-Sec01-Team45/actions/runs/44904873536/job/136848190995) | [Figure C-05.1](../../evidence/lab-05/l5-7/01-before.png) · [API capture](../../evidence/lab-05/l5-7/01-before.json) |
| After same-image restart · 19:28:20 ICT | `equipflow-00007-ns6` | `sha256:604e51553a794404a063f40bdbaa8d037ee94dd72c92a87a9a2b47ae65f3f7a0` | [Cloud Run revision history](https://console.cloud.google.com/run/detail/asia-southeast1/equipflow/revisions?project=cpe334-team45) | [Figure C-05.2](../../evidence/lab-05/l5-7/02-after-restart.png) · [API capture](../../evidence/lab-05/l5-7/02-after-restart.json) |
| After pinned rollback · 19:32:04 ICT | `equipflow-00008-qhg` | `sha256:63f3313f0da6d2bde90576eed25120fa889e2cf50a5da895a03c53c13cb353b1` | [Deploy run 45022560867](https://github.com/NxNxmm/CPE334-Sec01-Team45/actions/runs/45022560867/job/137208488447) | [Figure C-05.3](../../evidence/lab-05/l5-7/03-after-rollback.png) · [API capture](../../evidence/lab-05/l5-7/03-after-rollback.json) |
| After pinned roll-forward · 19:34:20 ICT | `equipflow-00009-kns` | `sha256:604e51553a794404a063f40bdbaa8d037ee94dd72c92a87a9a2b47ae65f3f7a0` | [Deploy run 45022823168](https://github.com/NxNxmm/CPE334-Sec01-Team45/actions/runs/45022823168/job/137209259668) | [Figure C-05.4](../../evidence/lab-05/l5-7/04-after-roll-forward.png) · [API capture](../../evidence/lab-05/l5-7/04-after-roll-forward.json) |

C-05 passed. The full API record matched at all four checkpoints, including request ID, asset tag, creation timestamp, note, and `PENDING` status. The request was also visible in each refreshed My Requests capture. Both pinned deployments skipped migrations and passed smoke checks. Release 2 was restored to 100% traffic on `equipflow-00009-kns`, and its KMUTT Lending Policy was visible on the sign-in page and in the signed-in portal.
