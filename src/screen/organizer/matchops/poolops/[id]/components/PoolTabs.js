import { Tabs, Tab } from '@mui/material';
import stl from './PoolTabs.module.scss';

const PoolTabs = ({ pools, selectedPool, onSelectPool }) => {
    if (!pools?.length) return null;

    return (
        <div className={stl.tabsContainer}>
            <Tabs
                value={selectedPool}
                onChange={(_, newValue) => onSelectPool(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                aria-label="Pool selection tabs"
            >
                {pools.map((pool) => (
                    <Tab
                        key={pool.name}
                        label={pool.name}
                        value={pool.name}
                        aria-label={`Select pool ${pool.name}`}
                    />
                ))}
            </Tabs>
        </div>
    );
};

export default PoolTabs; 