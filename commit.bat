git add .
git commit -m %1
git push origin sources
cd _site
git add .
git commit -m %1
git push origin master
cd .. 