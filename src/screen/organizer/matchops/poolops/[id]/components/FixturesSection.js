import { Button } from '@mui/material';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import stl from './FixturesSection.module.scss';

const FixturesSection = ({ pool, onGenerateFixtures }) => {
    if (!pool) {
        return (
            <div className={stl.noPool}>
                <p>Select a pool to view fixtures</p>
            </div>
        );
    }

    return (
        <div className={stl.fixturesContainer}>
            <div className={stl.header}>
                <h3>Fixtures</h3>
            </div>

            <div className={stl.content}>
                {pool.has_fixtures ? (
                    <div className={stl.hasFixtures}>
                        <SportsTennisIcon className={stl.icon} />
                        <p>Round Robin Fixtures have been generated</p>
                    </div>
                ) : (
                    <div className={stl.noFixtures}>
                        <SportsTennisIcon className={stl.icon} />
                        <p>Round Robin Fixtures not yet generated</p>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={onGenerateFixtures}
                            disabled={!pool.teams?.length}
                        >
                            Generate Fixtures
                        </Button>
                        {!pool.teams?.length && (
                            <p className={stl.note}>Add teams to generate fixtures</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FixturesSection; 