import {
  ActionIcon,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { IconCheck, IconDeviceFloppy, IconFolder, IconTrash } from '@tabler/icons-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useCalculator } from '../../hooks/useCalculatorContext';
import {
  deleteMyProject,
  getMyProject,
  groupProjectsByClient,
  listClientNames,
  listMyProjects,
  projectNameFromState,
  saveToMyProjects,
  type SavedProject,
} from '../../services/projects';
import { semanticColors } from '../../theme/palette';

function formatSavedAt(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function SaveToMyProjects({
  orientation = 'horizontal',
}: {
  orientation?: 'horizontal' | 'vertical';
}) {
  const { state, loadCalculatorState } = useCalculator();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [loadedFromLibrary, setLoadedFromLibrary] = useState(false);
  const [updateExisting, setUpdateExisting] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [clientDraft, setClientDraft] = useState('');
  const [clientOptions, setClientOptions] = useState<string[]>([]);
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [inviteSave, setInviteSave] = useState(false);
  const savedTimer = useRef<number | undefined>(undefined);
  const hadAddress = useRef(Boolean(state.site?.address?.trim()));
  const siteIdentity = state.site?.regridId || state.site?.address?.trim() || '';

  const hasAddress = Boolean(state.site?.address?.trim());
  const existingProject = projectId ? getMyProject(projectId) : undefined;

  useEffect(() => () => window.clearTimeout(savedTimer.current), []);

  useEffect(() => {
    setProjectId(null);
    setLoadedFromLibrary(false);
  }, [siteIdentity]);

  useEffect(() => {
    if (hasAddress && !hadAddress.current) {
      setInviteSave(true);
    }
    if (!hasAddress) setInviteSave(false);
    hadAddress.current = hasAddress;
  }, [hasAddress]);

  useEffect(() => {
    if (justSaved) setInviteSave(false);
  }, [justSaved]);

  const refreshProjects = () => setProjects(listMyProjects());
  const addressName = projectNameFromState(state);
  const clientGroups = useMemo(() => groupProjectsByClient(projects), [projects]);

  const openSaveDialog = () => {
    if (!hasAddress) return;
    const existing = projectId ? getMyProject(projectId) : undefined;
    const canUpdate = Boolean(existing && loadedFromLibrary);
    setNameDraft(existing?.name && existing.name !== addressName ? existing.name : '');
    setClientDraft(existing?.clientName ?? '');
    setClientOptions(listClientNames());
    setUpdateExisting(canUpdate);
    setSaveOpen(true);
  };

  const confirmSave = () => {
    const idToUpdate = updateExisting && existingProject ? projectId : null;
    const saved = saveToMyProjects(state, idToUpdate, nameDraft, clientDraft);
    setProjectId(saved.id);
    setLoadedFromLibrary(Boolean(idToUpdate));
    setSaveOpen(false);
    setJustSaved(true);
    window.clearTimeout(savedTimer.current);
    savedTimer.current = window.setTimeout(() => setJustSaved(false), 2000);
  };

  const handleOpenLibrary = () => {
    refreshProjects();
    setLibraryOpen(true);
  };

  const handleOpenProject = (project: SavedProject) => {
    loadCalculatorState(project.state);
    setProjectId(project.id);
    setLoadedFromLibrary(true);
    setLibraryOpen(false);
  };

  const handleDeleteProject = (id: string) => {
    deleteMyProject(id);
    if (projectId === id) {
      setProjectId(null);
      setLoadedFromLibrary(false);
    }
    refreshProjects();
  };

  const tooltipPosition = orientation === 'vertical' ? 'left' : 'bottom';
  const buttons = (
    <>
      <Tooltip label="My projects" position={tooltipPosition} withArrow>
        <ActionIcon
          variant="light"
          color={semanticColors.pulled}
          size="lg"
          radius="md"
          aria-label="My projects"
          onClick={handleOpenLibrary}
        >
          <IconFolder size={22} stroke={1.8} />
        </ActionIcon>
      </Tooltip>
      <Tooltip
        label={
          justSaved
            ? 'Saved to my projects'
            : hasAddress
              ? 'Save to my projects'
              : 'Enter a site address to save'
        }
        position={tooltipPosition}
        withArrow
      >
        <Box component="span" style={{ display: 'inline-flex' }}>
          <ActionIcon
            className="save-project-btn"
            data-ready={hasAddress}
            data-invite={inviteSave || undefined}
            variant={hasAddress ? 'filled' : 'light'}
            color={justSaved ? semanticColors.success : semanticColors.overridden}
            size="lg"
            radius="md"
            aria-label="Save to my projects"
            aria-disabled={!hasAddress}
            disabled={!hasAddress}
            onClick={openSaveDialog}
            onAnimationEnd={() => setInviteSave(false)}
          >
            {justSaved ? <IconCheck size={22} stroke={2.4} /> : <IconDeviceFloppy size={22} stroke={1.8} />}
          </ActionIcon>
        </Box>
      </Tooltip>
    </>
  );

  return (
    <>
      {orientation === 'vertical' ? (
        <Stack gap="xs" align="center" className="no-print">
          {buttons}
        </Stack>
      ) : (
        <Group gap={6} wrap="nowrap" className="no-print" justify="flex-end">
          {buttons}
        </Group>
      )}

      <Modal
        opened={saveOpen}
        onClose={() => setSaveOpen(false)}
        title="Save to my projects"
        size="sm"
      >
        <Stack gap="md">
          <Autocomplete
            label="Client name"
            description="Projects for the same client are grouped together."
            placeholder="e.g. Harbor Partners"
            data={clientOptions}
            value={clientDraft}
            onChange={setClientDraft}
            autoFocus
          />
          <TextInput
            label="Project name"
            description="Leave blank to use the site address."
            placeholder={addressName}
            value={nameDraft}
            onChange={(e) => setNameDraft(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') confirmSave();
            }}
          />
          {existingProject && (
            <Checkbox
              checked={updateExisting}
              onChange={(e) => setUpdateExisting(e.currentTarget.checked)}
              label={`Update existing “${existingProject.name}” instead of creating a new project`}
            />
          )}
          <Group justify="flex-end" gap="xs">
            <Button variant="default" onClick={() => setSaveOpen(false)}>
              Cancel
            </Button>
            <Button color={semanticColors.pulled} onClick={confirmSave}>
              {updateExisting && existingProject ? 'Update' : 'Save'}
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        title="My projects"
        size="md"
      >
        {projects.length === 0 ? (
          <Text size="sm" c="dimmed">
            No saved projects yet. Use Save to my projects to store this run, including the current
            step and all site, comps, program, and cost inputs.
          </Text>
        ) : (
          <Stack gap="lg">
            {clientGroups.map((group) => (
              <div key={group.client}>
                <div className="my-projects-client">
                  <Text size="sm" fw={700} truncate>
                    {group.client}
                  </Text>
                  <Text size="xs" fw={600} style={{ whiteSpace: 'nowrap' }}>
                    {group.projects.length} {group.projects.length === 1 ? 'project' : 'projects'}
                  </Text>
                </div>
                <Stack gap="xs">
                  {group.projects.map((project) => (
                    <Group
                      key={project.id}
                      wrap="nowrap"
                      gap="xs"
                      p="sm"
                      style={{
                        border: '1px solid var(--mantine-color-gray-2)',
                        borderRadius: 'var(--mantine-radius-md)',
                      }}
                    >
                      <UnstyledButton
                        onClick={() => handleOpenProject(project)}
                        style={{ flex: 1, minWidth: 0, textAlign: 'left' }}
                      >
                        <Text size="sm" fw={600} truncate>
                          {project.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {formatSavedAt(project.savedAt)}
                          {project.state.activeStep ? ` · Step: ${project.state.activeStep}` : ''}
                        </Text>
                      </UnstyledButton>
                      <Tooltip label="Remove" withArrow>
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          aria-label={`Remove ${project.name}`}
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  ))}
                </Stack>
              </div>
            ))}
          </Stack>
        )}
      </Modal>
    </>
  );
}
