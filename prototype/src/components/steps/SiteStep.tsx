import {
  Alert,
  Button,
  Combobox,
  InputBase,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
  useCombobox,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useCalculator } from '../../hooks/useCalculatorContext';
import { semanticColors } from '../../theme/palette';
import type { TypeaheadResult } from '../../services/regrid/types';
import { SiteMapPreview } from './SiteMapPreview';
import { SiteSummary } from './SiteSummary';
import { StepNextButton } from '../workflow/StepNextButton';

export function SiteStep() {
  const {
    state,
    siteLoading,
    siteError,
    searchSites,
    selectSiteByRegridId,
    clearSite,
    updateSiteField,
    setActiveStep,
  } = useCalculator();
  const { site } = state;

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 250);
  const [results, setResults] = useState<TypeaheadResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [advanceBlocked, setAdvanceBlocked] = useState(false);

  useEffect(() => {
    if (site) {
      setSearch(site.address);
      setAdvanceBlocked(false);
    }
  }, [site]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (debouncedSearch.trim().length < 2) {
        setResults([]);
        return;
      }
      setSearching(true);
      try {
        const matches = await searchSites(debouncedSearch);
        if (!cancelled) setResults(matches);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, searchSites]);

  const handleSelect = async (ll_uuid: string) => {
    const match = results.find((r) => r.ll_uuid === ll_uuid);
    if (match) {
      setSearch(match.address);
      combobox.closeDropdown();
      await selectSiteByRegridId(ll_uuid);
    }
  };

  const handleClear = () => {
    setSearch('');
    setResults([]);
    clearSite();
  };

  const handleNext = () => {
    if (!site) {
      setAdvanceBlocked(true);
      return;
    }
    setActiveStep('comps');
  };

  return (
    <Stack gap="lg">
      <div>
        <Title order={2}>Site</Title>
        <Text c="dimmed" mt={4}>
          Select a site to auto-populate parcel data
        </Text>
      </div>

      <Paper withBorder p="lg" radius="md" bg="#ffffff">
        <Stack gap="md">
          <Combobox
            store={combobox}
            onOptionSubmit={(value) => handleSelect(value)}
            withinPortal
          >
            <Combobox.Target>
              <InputBase
                label="Site address"
                placeholder="Search by address or parcel ID"
                value={search}
                onChange={(e) => {
                  setSearch(e.currentTarget.value);
                  combobox.openDropdown();
                  combobox.updateSelectedOptionIndex();
                }}
                onClick={() => combobox.openDropdown()}
                onFocus={() => combobox.openDropdown()}
                onBlur={() => combobox.closeDropdown()}
                leftSection={<IconSearch size={16} />}
                rightSection={
                  siteLoading || searching ? <Loader size={16} /> : null
                }
                rightSectionPointerEvents="none"
              />
            </Combobox.Target>

            <Combobox.Dropdown>
              <Combobox.Options>
                {searching && results.length === 0 && (
                  <Combobox.Empty>Searching Regrid…</Combobox.Empty>
                )}
                {!searching && debouncedSearch.length >= 2 && results.length === 0 && (
                  <Combobox.Empty>No parcels found</Combobox.Empty>
                )}
                {debouncedSearch.length < 2 && (
                  <Combobox.Empty>Type at least 2 characters</Combobox.Empty>
                )}
                {results.map((result) => (
                  <Combobox.Option key={result.ll_uuid} value={result.ll_uuid}>
                    <div>
                      <Text size="sm">{result.address}</Text>
                      <Text size="xs" c="dimmed">
                        {result.context}
                      </Text>
                    </div>
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </Combobox.Dropdown>
          </Combobox>

          {site && (
            <Button variant="subtle" size="xs" onClick={handleClear} w="fit-content">
              Clear selection
            </Button>
          )}

          {siteError && (
            <Alert color={semanticColors.error} title="Could not load parcel">
              {siteError}
            </Alert>
          )}
        </Stack>
      </Paper>

      {advanceBlocked && !site && (
        <Alert color={semanticColors.computed} variant="light" title="No site selected">
          Search for an address to pull parcel data from Regrid. Try &quot;Riverside&quot; or
          &quot;Research&quot; in the mock dataset.
        </Alert>
      )}

      {site && (
        <>
          <SiteMapPreview site={site} />

          <Paper withBorder p="lg" radius="md" bg="#ffffff">
            <SiteSummary site={site} onUpdate={updateSiteField} />
          </Paper>
        </>
      )}

      <StepNextButton onClick={handleNext} />
    </Stack>
  );
}
