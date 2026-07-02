import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { formatPlantNameForList } from '@/components/helpers';
import { RootState } from '@/redux/store';

export function useFormatPlantName() {
    const mode = useSelector((state: RootState) => state.data.plantListNameMode);

    return useCallback(
        (name: string) => formatPlantNameForList(name, mode),
        [mode],
    );
}
