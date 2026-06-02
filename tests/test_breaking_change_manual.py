import sys, types
sys.path.insert(0, "/tmp/evosrc")
# stub pydantic (not needed by these modules but domain import chain may pull it)
pyd = types.ModuleType("pydantic")
class BaseModel:
    def __init__(self, **kw):
        for k,v in kw.items(): setattr(self,k,v)
def Field(default=None, default_factory=None, **kw):
    return default_factory() if default_factory else default
pyd.BaseModel=BaseModel; pyd.Field=Field
sys.modules["pydantic"]=pyd

from codegraph.ingestion.git_loader import iter_history, list_commits
from codegraph.evolution.breaking_change_detector import scan_history

REPO="/tmp/demo_repo"
print("=== commits ===")
for c in list_commits(REPO):
    print(" ", c.short_sha, c.subject)

snaps = list(iter_history(REPO, src_prefixes=("src/",)))
print(f"\nloaded {len(snaps)} snapshots")
for s in snaps:
    nfuncs = sum(len([n for n in p.nodes if n.kind in ('function','method')]) for p in s.parses)
    print(f"  {s.commit.short_sha}: {len(s.parses)} files, {nfuncs} callables, changed={s.changed_files}")

print("\n=== BREAKING CHANGES DETECTED ===")
changes = scan_history(snaps)
for bc in changes:
    print(f"\n[{bc.kind}] {bc.qualified_name}")
    print(f"  commit: {bc.commit_short} \"{bc.commit_subject}\"")
    print(f"  detail: {bc.detail}")
    print(f"  old: {bc.old_signature!r}  new: {bc.new_signature!r}")
    print(f"  callers still depending: {bc.callers}")

# assertions
kinds = {(bc.kind, bc.qualified_name) for bc in changes}
assert ("REQUIRED_PARAM_ADDED", "api.get_user") in kinds, f"missing get_user breaking; got {kinds}"
assert any(bc.kind=="SYMBOL_REMOVED" and bc.qualified_name=="util.fmt" for bc in changes), f"missing fmt removal; got {kinds}"
# get_user breaking must point at commit 3 and list service.load as caller
gu = next(bc for bc in changes if bc.qualified_name=="api.get_user")
assert "tenant" in gu.commit_subject
assert any("load" in c for c in gu.callers), f"get_user callers wrong: {gu.callers}"
print("\nALL ASSERTIONS PASSED")
