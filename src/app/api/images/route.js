import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const seasons = ['s1', 's2', 's3', 's4', 's5'];
    const images = {};
    
    for (const season of seasons) {
      const seasonPath = path.join(process.cwd(), 'public', 'bul', 'images', season);
      try {
        const files = await fs.readdir(seasonPath);
        images[season] = files.filter(file => 
          file.toLowerCase().endsWith('.jpg') || 
          file.toLowerCase().endsWith('.jpeg') || 
          file.toLowerCase().endsWith('.png')
        );
      } catch (error) {
        console.error(`Error reading season ${season}:`, error);
        images[season] = [];
      }
    }
    
    const leaderboardPath = path.join(process.cwd(), 'public', 'bul', 'leaderboard');
    try {
      const files = await fs.readdir(leaderboardPath);
      const leaderboardImages = files.filter(file => 
        file.toLowerCase().endsWith('.jpg') || 
        file.toLowerCase().endsWith('.jpeg') || 
        file.toLowerCase().endsWith('.png')
      );

      const numberedImages = leaderboardImages.filter(file => /^[1-3]\.jpg$/i.test(file))
        .sort((a, b) => parseInt(a) - parseInt(b));
      const otherImages = leaderboardImages.filter(file => !/^[1-3]\.jpg$/i.test(file));

      images.leaderboard = {
        featured: numberedImages,
        gallery: otherImages
      };
    } catch (error) {
      console.error('Error reading leaderboard images:', error);
      images.leaderboard = { featured: [], gallery: [] };
    }
    
    return Response.json({ images });
  } catch (error) {
    console.error('Error fetching images:', error);
    return Response.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
} 