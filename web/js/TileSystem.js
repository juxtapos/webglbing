var TileSystem = 
{
    EarthRadius : 6378137,
    MinLatitude : -85.05112878,
    MaxLatitude: 85.05112878,
    MinLongitude: -180,
    MaxLongitude: 180,


    /// <summary>
    /// Clips a number to the specified minimum and maximum values.
    /// </summary>
    /// <param name="n">The number to clip.</param>
    /// <param name="minValue">Minimum allowable value.</param>
    /// <param name="maxValue">Maximum allowable value.</param>
    /// <returns>The clipped value.</returns>
    clip: function (dn, minValue, maxValue)
    {
        return Math.min(Math.max(dn, minValue), maxValue);
    },
    
    

    /// <summary>
    /// Determines the map width and height (in pixels) at a specified level
    /// of detail.
    /// </summary>
    /// <param name="levelOfDetail">Level of detail, from 1 (lowest detail)
    /// to 23 (highest detail).</param>
    /// <returns>The map width and height in pixels.</returns>
    mapSize: function (levelOfDetail)
    {
        return 256 << levelOfDetail;
    },



    /// <summary>
    /// Determines the ground resolution (in meters per pixel) at a specified
    /// latitude and level of detail.
    /// </summary>
    /// <param name="latitude">Latitude (in degrees) at which to measure the
    /// ground resolution.</param>
    /// <param name="levelOfDetail">Level of detail, from 1 (lowest detail)
    /// to 23 (highest detail).</param>
    /// <returns>The ground resolution, in meters per pixel.</returns>
    groundResolution: function (latitude,levelOfDetail)
    {
        latitude = this.clip(latitude, this.MinLatitude, this.MaxLatitude);
        return Math.cos(latitude * Math.PI / 180) * 2 * Math.PI * this.EarthRadius / this.mapSize(levelOfDetail);
    },



    /// <summary>
    /// Determines the map scale at a specified latitude, level of detail,
    /// and screen resolution.
    /// </summary>
    /// <param name="latitude">Latitude (in degrees) at which to measure the
    /// map scale.</param>
    /// <param name="levelOfDetail">Level of detail, from 1 (lowest detail)
    /// to 23 (highest detail).</param>
    /// <param name="screenDpi">Resolution of the screen, in dots per inch.</param>
    /// <returns>The map scale, expressed as the denominator N of the ratio 1 : N.</returns>
    mapScale: function (latitude,levelOfDetail,screenDpi)
    {
        return this.groundResolution(latitude, levelOfDetail) * screenDpi / 0.0254;
    },



    /// <summary>
    /// Converts a point from latitude/longitude WGS-84 coordinates (in degrees)
    /// into pixel XY coordinates at a specified level of detail.
    /// </summary>
    /// <param name="latitude">Latitude of the point, in degrees.</param>
    /// <param name="longitude">Longitude of the point, in degrees.</param>
    /// <param name="levelOfDetail">Level of detail, from 1 (lowest detail)
    /// to 23 (highest detail).</param>
    /// <param name="pixelX">Output parameter receiving the X coordinate in pixels.</param>
    /// <param name="pixelY">Output parameter receiving the Y coordinate in pixels.</param>
    latLongToPixelXY: function (latitude, longitude, levelOfDetail)
    {
        latitude = this.clip(latitude, this.MinLatitude, this.MaxLatitude);
        longitude = this.clip(longitude, this.MinLongitude, this.MaxLongitude);

        x = (longitude + 180) / 360; 
        sinLatitude = Math.sin(latitude * Math.PI / 180);
        y = 0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (4 * Math.PI);

        mapSize = this.mapSize(levelOfDetail);
        return {
            pixelX: this.clip(x * mapSize + 0.5, 0, mapSize - 1),
            pixelY: this.clip(y * mapSize + 0.5, 0, mapSize - 1)
        }
    },



    /// <summary>
    /// Converts a pixel from pixel XY coordinates at a specified level of detail
    /// into latitude/longitude WGS-84 coordinates (in degrees).
    /// </summary>
    /// <param name="pixelX">X coordinate of the point, in pixels.</param>
    /// <param name="pixelY">Y coordinates of the point, in pixels.</param>
    /// <param name="levelOfDetail">Level of detail, from 1 (lowest detail)
    /// to 23 (highest detail).</param>
    /// <param name="latitude">Output parameter receiving the latitude in degrees.</param>
    /// <param name="longitude">Output parameter receiving the longitude in degrees.</param>
    pixelXYToLatLong: function (pixelX, pixelY, levelOfDetail)
    {
        mapSize = this.mapSize(levelOfDetail);
        x = (this.clip(pixelX, 0, mapSize - 1) / mapSize) - 0.5;
        y = 0.5 - (this.clip(pixelY, 0, mapSize - 1) / mapSize);

        return {
            latitude: 90 - 360 * Math.atan(Math.exp(-y * 2 * Math.PI)) / Math.PI,
            longitude: 360 * x
        }
    },



    /// <summary>
    /// Converts pixel XY coordinates into tile XY coordinates of the tile containing
    /// the specified pixel.
    /// </summary>
    /// <param name="pixelX">Pixel X coordinate.</param>
    /// <param name="pixelY">Pixel Y coordinate.</param>
    /// <param name="tileX">Output parameter receiving the tile X coordinate.</param>
    /// <param name="tileY">Output parameter receiving the tile Y coordinate.</param>
    pixelXYToTileXY: function (pixelX, pixelY)
    {
        return {
            tileX: pixelX / 256,
            tileY: pixelY / 256
        }
    },



    /// <summary>
    /// Converts tile XY coordinates into pixel XY coordinates of the upper-left pixel
    /// of the specified tile.
    /// </summary>
    /// <param name="tileX">Tile X coordinate.</param>
    /// <param name="tileY">Tile Y coordinate.</param>
    /// <param name="pixelX">Output parameter receiving the pixel X coordinate.</param>
    /// <param name="pixelY">Output parameter receiving the pixel Y coordinate.</param>
    tileXYToPixelXY: function (tileX, tileY)
    {
        return {
            pixelX: tileX * 256,
            pixelY: tileY * 256    
        }
    },



    /// <summary>
    /// Converts tile XY coordinates into a QuadKey at a specified level of detail.
    /// </summary>
    /// <param name="tileX">Tile X coordinate.</param>
    /// <param name="tileY">Tile Y coordinate.</param>
    /// <param name="levelOfDetail">Level of detail, from 1 (lowest detail)
    /// to 23 (highest detail).</param>
    /// <returns>A string containing the QuadKey.</returns>
    tileXYToQuadKey: function (tileX, tileY, levelOfDetail)
    {
        quadKey = '';
        for (i = levelOfDetail; i > 0; i--)
        {
            digit = '0';
            mask = 1 << (i - 1);
            if ((tileX & mask) != 0) 
            {
                digit++;
            }
            if ((tileY & mask) != 0) 
            {
                digit++;
                digit++;
            }
            quadKey += digit;
        }
        return quadKey;
    },



    /// <summary>
    /// Converts a QuadKey into tile XY coordinates.
    /// </summary>
    /// <param name="quadKey">QuadKey of the tile.</param>
    /// <param name="tileX">Output parameter receiving the tile X coordinate.</param>
    /// <param name="tileY">Output parameter receiving the tile Y coordinate.</param>
    /// <param name="levelOfDetail">Output parameter receiving the level of detail.</param>
    quadKeyToTileXY: function (quadKey)
    {
        tileX = tileY = 0;
        levelOfDetail = quadKey.length;
        for (i = levelOfDetail; i > 0; i--)
        {
            mask = 1 << (i - 1);
            switch (quadKey[levelOfDetail - i]) 
            {
                case '0':
                    break;

                case '1':
                    tileX |= mask;
                    break;

                case '2':
                    tileY |= mask;
                    break;

                case '3':
                    tileX |= mask;
                    tileY |= mask;
                    break;

                default:
                    throw new ArgumentException("Invalid QuadKey digit sequence.");
            }
        }
        return {
            tileX: tileX,
            tileY: tileY,
            levelOfDetail: levelOfDetail
        }
    }
}